import fetch from "node-fetch"
import https from "https";
import debug from "debug";
const log = debug("keygen.js");

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
        return await this.fetch({ endpoint: "tokens", api_key, auth: "Basic" });
    }

    async createProduct(api_key, attributes = {}) {
        const body = { "type": "product", attributes };
        return await this.fetch({ endpoint: "products", api_key, body });
    }

    async createPolicy(api_key, product_id, attributes = {}) {
        const body = {
            "type": "policy",
            attributes,
            "relationships": {
                "product": { "data": { "type": "product", "id": product_id } }
            }
        };

        return await this.fetch({ endpoint: "policies", api_key, body });
    }

    async createLicense(api_key, policy_id, metadata = null) {
        const body = {
            "type": "license",
            "attributes": {},
            "relationships": {
                "policy": { "data": { "type": "policy", "id": policy_id } }
            }
        };

        if (metadata) {
            body.attributes.metadata = metadata;
        }

        return await this.fetch({ endpoint: "licenses", api_key, body });
    }

    /*
    async createLicense(api_key, attributes = {}) {
        // const body = { "type": "product", attributes };
        const body = {
            "type": "license",
            "attributes": {},
            "relationships": {
                "policy": {
                    "data": {
                        "type": "policy",
                        "id": "5dc97f67-5905-439f-81ab-5e43b42bfb94"
                    }
                }
            }
        }
    
        return await this.fetch({
            endpoint: "licenses",
            api_key,
            body
        });
    }
    */

    /*
       -d '{
         "data": 
       }'
       */

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

Keygen.TRIAL_POLICY = {
    "name": "Trial Policy",
    "duration": 604800,
    "maxMachines": 1,
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
};

Keygen.PAID_POLICY = {
    "name": "Paid Policy",
    "duration": null,
    "maxMachines": 5,
    "floating": true,
    "transferStrategy": "RESET_EXPIRY",
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
};
