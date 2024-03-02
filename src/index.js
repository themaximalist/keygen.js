import fetch from "node-fetch"
import https from "https";
import debug from "debug";
const log = debug("keygen.js");
log("SUP");

export default class Keygen {
    constructor(config = {}) {
        this.config = config;
        this.base_url = config.base_url || "https://api.keygen.localhost";
        this.ignore_ssl = config.ignore_ssl || false;

        this.account_id = config.account_id;
        if (!this.account_id) throw new Error("Missing account_id");
    }

    async createToken(email, password) {
        const api_key = Buffer.from(`${email}:${password}`).toString("base64")
        return await this.fetch({
            endpoint: "tokens",
            api_key,
            auth: "Basic"
        });
    }

    async createProduct(api_key, attributes = {}) {
        const body = {
            "type": "product",
            attributes,
        };

        return await this.fetch({
            endpoint: "products",
            api_key,
            body
        });
    }

    url(path) {
        return `${this.base_url}/v1/accounts/${this.account_id}/${path}`;
    }

    async fetch({ endpoint, api_key, body, auth = "Bearer" } = {}) {
        const url = this.url(endpoint);

        const options = {
            method: "POST",
            headers: {
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                "Authorization": `${auth} ${api_key}`
            }
        };

        if (body) {
            options.body = JSON.stringify({ data: body });
        }

        if (this.ignore_ssl) {
            options.agent = new https.Agent({ rejectUnauthorized: false });
        }

        log(`fetching ${url} with options ${JSON.stringify(options, null, 2)}`);

        const response = await fetch(url, options)

        const { data, errors } = await response.json()
        if (errors) {
            const err = `Error: ${errors[0].title} - ${errors[0].detail}`
            throw new Error(err);
        }

        return data;
    }
}