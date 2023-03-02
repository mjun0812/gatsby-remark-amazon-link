/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
// exports.onPreInit = () => console.log("Loaded gatsby-remark-amazon-link")

exports.pluginOptionsSchema = ({ Joi }) => {
    return Joi.object({
        convertTitle: Joi.string()
            .default('$amazon')
            .description('Title of markdown link to convert'),
        marketplace: Joi.string()
            .default('www.amazon.co.jp')
            .description('Target of amazon region'),
        partnerTag: Joi.string()
            .required()
            .description('Amazon Associates tag.'),
        accessKey: Joi.string()
            .required()
            .description("Access key"),
        secretKey: Joi.string()
            .required()
            .description("Secret key")
    })
}