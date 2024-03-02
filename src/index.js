import fetch from "node-fetch"
import https from "https";
import debug from "debug";
const log = debug("keygen.js");
import { machineIdSync } from 'node-machine-id';


export default class Keygen {
    constructor(config = {}) {
        this.config = config;
        this.base_url = config.base_url || "https://api.keygen.localhost";
        this.ignore_ssl = config.ignore_ssl || false;

        this.account_id = config.account_id;
        if (!this.account_id) throw new Error("Missing account_id");

        this.machine_id = config.machine_id || machineIdSync();
        if (!this.machine_id) throw new Error("Missing machine_id");
    }

    async createToken(email, password) {
        const api_key = Buffer.from(`${email}:${password}`).toString("base64")
        return await this.fetch({ endpoint: "tokens", api_key, auth: "Basic" });
    }

    async createProduct(api_key, attributes = {}) {
        const body = { data: { "type": "product", attributes } };
        return await this.fetch({ endpoint: "products", api_key, body });
    }

    async createPolicy(api_key, product_id, attributes = {}) {
        const body = {
            data: {
                "type": "policy",
                attributes,
                "relationships": {
                    "product": { "data": { "type": "product", "id": product_id } }
                }
            }
        };

        return await this.fetch({ endpoint: "policies", api_key, body });
    }

    async createLicense(api_key, policy_id, metadata = null) {
        const body = {
            data: {
                "type": "license",
                "attributes": {},
                "relationships": {
                    "policy": { "data": { "type": "policy", "id": policy_id } }
                }
            }
        };

        if (metadata) {
            body.data.attributes.metadata = metadata;
        }

        return await this.fetch({ endpoint: "licenses", api_key, body });
    }

    async validateLicense(api_key, license) {
        const body = {
            "meta": { "key": license }
        }

        return await this.fetch({ endpoint: "licenses/actions/validate-key", api_key, body });
    }

    async activateLicense(api_key, license) {
        const body = {
            "data": {
                "type": "machines",
                "attributes": { "fingerprint": this.machine_id },
                "relationships": {
                    "license": { "data": { "type": "licenses", "id": license } }
                }
            }
        };

        return await this.fetch({ endpoint: "machines", api_key, body });
    }

    async deactivateLicense(api_key, activation_id) {
        return await this.fetch({
            endpoint: `machines/${activation_id}`,
            method: "DELETE",
            api_key,
        });
    }

    url(path) {
        return `${this.base_url}/v1/accounts/${this.account_id}/${path}`;
    }

    async fetch({ endpoint, api_key, body, method = "POST", auth = "Bearer" } = {}) {
        const url = this.url(endpoint);

        const options = {
            method,
            headers: {
                "Accept": "application/vnd.api+json",
                "Content-Type": "application/vnd.api+json",
                "Authorization": `${auth} ${api_key}`
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        if (this.ignore_ssl) {
            options.agent = new https.Agent({ rejectUnauthorized: false });
        }

        log(`fetching ${url} with options ${JSON.stringify(options, null, 2)}`);

        const response = await fetch(url, options)

        if (response.status === 204) { // no content
            return {};
        }

        const { meta, data, errors } = await response.json()
        if (errors) {
            // console.log("ERRORS", errors);
            const err = `Error: ${errors[0].title} - ${errors[0].detail}`
            throw new Error(err);
        }

        if (meta && Object.keys(meta).length > 0) {
            return meta;
        }

        return data;
    }
}

Keygen.PAID_POLICY = {
    "name": "Paid Policy",
    "duration": null,
    "maxMachines": 5,
    "floating": true,
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
};
