const visit = require('unist-util-visit')
const amazonPaapi = require("amazon-paapi")

module.exports = async ({ markdownAST }, pluginOptions) => {
    const links = []
    const { convertTitle, marketplace, partnerTag, accessKey, secretKey } = pluginOptions

    visit(markdownAST, 'link', node => {
        const { url } = node
        const title = node.children[0].value

        if (title !== convertTitle) {
            return
        }
        if (url.indexOf(marketplace.replace("www.", "")) === -1) {
            return
        }

        links.push({ url: url, target: node })
    })


    if (links.length == 0) {
        return markdownAST
    }
    await convertLink(links, accessKey, secretKey, partnerTag, marketplace)

    return markdownAST
}

const convertLink = async (links, accessKey, secretKey, partnerTag, marketplace) => {
    let asins = links.map((link) => {
        return link.url.match(/[^0-9A-Z]([0-9A-Z]{10})([^0-9A-Z]|$)/)[1]
    })
    let results = await fetchAmazon(asins, accessKey, secretKey, partnerTag, marketplace)
    for (let i = 0; i < links.length; i++) {
        if (results[i] == null) {
            continue
        }

        let title = results[i].ItemInfo.Title.DisplayValue
        let imageUrl = results[i].Images.Primary.Medium.URL
        let url = results[i].DetailPageURL

        html = getHTML(title, imageUrl, url, marketplace)
        let node = links[i].target
        node.type = 'html'
        node.value = html
        node.children = undefined
    }
}

const getHTML = (title, imageUrl, url, marketplace) => {
    return `
      <div>
        <a class="amazon-card-container" href="${url}">
          <div class="amazon-card-body">
            <div class="amazon-card-title">${title}</div>
            <div class="amazon-card-domain">${marketplace.replace("www.", "")}</div>
          </div>
          <div class="amazon-card-image-container" >
            <img class="amazon-card-image" src="${imageUrl}" loading="lazy" alt="${title}-image" />
          </div>
        </a>
      </div>
      `.trim()
}

async function fetchAmazon(asins, accessKey, secretKey, partnerTag, marketplace) {
    const commonParameters = {
        AccessKey: accessKey,
        SecretKey: secretKey,
        PartnerTag: partnerTag,
        PartnerType: "Associates",
        Marketplace: marketplace,
    }

    const requestPatameters = {
        ItemIds: asins,
        ItemIdType: 'ASIN',
        Resources: [
            'ItemInfo.Title',
            'Images.Primary.Medium'
        ]
    }

    try {
        const data = await amazonPaapi
            .GetItems(commonParameters, requestPatameters)
        return data.ItemsResult.Items
    } catch (error) {
        return null
    }
}