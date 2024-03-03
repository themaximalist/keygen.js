## Keygen.js

> A Node.js library for [Keygen.sh](https://keygen.sh/), a license management server.

<div class="badges" style="text-align: center; margin-top: -10px;">
<a href="https://github.com/themaximal1st/keygen.js"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/themaximal1st/keygen.js"></a>
<a href="https://www.npmjs.com/package/@themaximalist/keygen.js"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/%40themaximalist%2Fkeygen.js"></a>
<a href="https://github.com/themaximal1st/keygen.js"><img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/themaximal1st/keygen.js"></a>
<a href="https://github.com/themaximal1st/keygen.js"><img alt="GitHub License" src="https://img.shields.io/github/license/themaximal1st/keygen.js"></a>
</div>
<br />

**Keygen.js** is a library for interacting with [Keygen.sh](https://keygen.sh/), a service for managing license keys in software.

If you're an app developer, and you sell software with a license, Keygen.sh is an easy API to manage that. They provide a self-hosted option, so you can run it on your own servers.

`Keygen.js` is a Node.js library that's a convenient wrapper around the API.

It offers two primary use cases:

* Used for validating keys on the frontend (like in your Electron or Express.js based app)
* Used for managing products, licenses and policies by an admin


## Install

Install `Keygen.js` from NPM:

```bash
npm install @themaximalist/keygen.js
```

Setting up Keygen is straight forward—check out their [self hosted](https://keygen.sh/docs/self-hosting/) documentation.

You'll need your `KEYGEN_ACCOUNT_ID` to use `Keygen.js`, which the docs above show you how you retrieve.

## Usage

Here's how to use `Keygen.js` to:

* Create an API token
* Create a new product
* Create a new license type (policy)
* Create a new license

```javascript
const Keygen = require("@themaximalist/keygen.js");

// set these from the install step, or load them through the environment
const account_id = process.env.KEYGEN_ACCOUNT_ID;
const account_email = process.env.KEYGEN_ACCOUNT_EMAIL;
const account_password = process.env.KEYGEN_ACCOUNT_PASSWORD;

// create keygen for this account
const keygen = new Keygen({ account_id });

// generate a token..can be saved and reused
const token = await keygen.createToken(account_email, account_password);
const api_key = token.attributes.token;

// create a new product
const product = await keygen.createProduct(api_key, {
    "name": "AppName"
});

// create a new policy for the product
const policy = await keygen.createPolicy(api_key, product.id, {
    "name": "Paid License",
    "duration": null,
    "maxMachines": 5,
    "floating": true,
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
});

// create a new license
const license = await keygen.createLicense(api_key, paid_policy.id, {
    email: "email@example.com"
});

// this is what the user will use to register the software
const license_key = license.attributes.key;

```

This shows how an admin can initialize Keygen to create licenses for a new product type with a specific license type.



## Client Side Validation

Keygen can also be used on the frontend—without specifying your admin email and password. All you need is an account ID to get started.

```javascript
const keygen = new Keygen({ account_id });
const { valid } = await keygen.validateLicense(license_key);

// valid will be true or false, depending on whether the license key is valid
```

This let's you check license keys client side, like in an Electron app, without worrying about leaking your admin credentials.

## API

The `Keygen.js` API provides a simple to manage your Keygen service.

```javascript
new Keygen({
  account_id: "...",
  base_url: "https://api.keygen.localhost",
  ignore_ssl: false,
  machine_id: "...",
});

```
**Config**

The `account_id` config is required, everything else is optional.

* **`account_id`** `<string>`: Keygen account ID (required)
* **`base_url`** `<string>`: Endpoint for Keygen server. Defaults to `https://api.keygen.localhost`
* **`ignore_ssl`** `<bool>`: Ignore SSL errors. Useful in development, don't use in production! Defaults to `false`.
* **`machine_id`** `<string>`: Unique ID to use for identifying the machine. Defaults to internally generated value.

### Methods

<div class="compressed-group">

#### `async createToken(email, password)`

Create an API token that can be used with the other API requests.

This is the `email` and `password` for the current `account_id`.

```javascript
const token = await keygen.creatToken(email, password);
const api_key = token.attributes.token;
```
#### `async createProduct(api_key, attributes={})`

Create a new product.

```javascript
const product = await keygen.createProduct(api_key, {
    "name": "HyperTyper"
});
```

#### `async getProducts(api_key, limit=100)`

Get all products for an account, up to limit.

```javascript
const products = await keygen.getProducts(api_key);
```

#### `async getProduct(api_key, product_id)`

Get an existing product by id.

```javascript
const product = await keygen.getProduct(api_key, product_id);
```

#### `async createPolicy(api_key, product_id, attributes={})`

Create a new policy for a product, with specific attributes.

```javascript
const product = await keygen.createPolicy(api_key, product_id, {
    "name": "Paid Policy",
    "duration": null,
    "maxMachines": 5,
    "floating": true,
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
});
```

#### `async getPolicies(api_key, product_id, limit=100)`

Get all policies for a product, up to limit.

```javascript
const policies = await keygen.getPolicies(api_key, product_id);
```

#### `async createLicense(api_key, policy_id, metadata={})`

Create a new license for a policy, with associated metadata.

```javascript
const license = await keygen.createLicense(api_key, policy_id, {
	email: "email@example.com",
});
const key = license.attributes.key;
```

#### `async getLicenses(api_key, product_id, limit=100)`

Get all licenses for a product, up to limit.

```javascript
const licenses = await keygen.getLicenses(api_key, product_id);
```

#### `async getLicense(api_key, license_id)`

Get license by license ID (not key).

```javascript
const license = await keygen.getLicense(api_key, license_id);
```

#### `async validateLicense(license_key)`

Validate a license key.

```javascript
const { valid } = await keygen.validateLicense(key);
```

</div>

### Static Variables
* **`PAID_POLICY`** `<object>`: `{
    "name": "Paid Policy",
    "duration": null,
    "maxMachines": 5,
    "floating": true,
    "machineUniquenessStrategy": "UNIQUE_PER_POLICY"
}`

## Admin Server

`Keygen.js` is a great way to manage software licenses programatically, but to manage them with a UI, check out [Keygen Admin](https://github.com/themaximal1st/keygen-admin). It's an admin dashboard on top if `Keygen.js` for managing your software licenses.

If you'd rather skip the headache of running your own server, check out of the official [Keygen.sh](https;//keygen.sh) hosted service.


## Projects

`Keygen.js` is currently used in the following projects:

-   [HyperTyper](https://hypertyper.com) — multidimensional mind mapping

## License

MIT


## Author

Created by [The Maximalist](https://twitter.com/themaximal1st), see our [open-source projects](https://themaximalist.com/products).

