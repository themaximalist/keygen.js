import fetch from "node-fetch"
import https from "https";

export default class Keygen {
    constructor(config = {}) {
        this.config = config;
        this.base_url = config.base_url || "https://api.keygen.localhost";
        this.ignore_ssl = config.ignore_ssl || false;

        this.account_id = config.account_id;
        if (!this.account_id) throw new Error("Missing account_id");
    }

    async createToken(email, password) {
        const credentials = Buffer.from(`${email}:${password}`).toString("base64")
        return await this.fetch("tokens", credentials);
    }

    url(path) {
        return `${this.base_url}/v1/accounts/${this.account_id}/${path}`;
    }

    async fetch(endpoint, api_key) {
        const url = this.url(endpoint);

        const options = {
            method: "POST",
            headers: {
                "Accept": "application/vnd.api+json",
                "Authorization": `Basic ${api_key}`
            }
        };

        if (this.ignore_ssl) {
            options.agent = new https.Agent({ rejectUnauthorized: false });
        }

        const response = await fetch(url, options)

        const { data, errors } = await response.json()
        if (errors) throw new Error(errors);

        return data;
    }
}