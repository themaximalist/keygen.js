import { test, expect, vi } from "vitest";
import Keygen from "../src/index.js";
import dotenv from "dotenv-extended";
dotenv.load();

vi.setConfig({ sequence: { shuffle: false } });

const account_id = process.env.KEYGEN_ACCOUNT_ID;
const user_email = process.env.KEYGEN_ACCOUNT_EMAIL;
const user_password = process.env.KEYGEN_ACCOUNT_PASSWORD;

const keygen = new Keygen({ account_id, ignore_ssl: true });
let token = null;
let product = null;
let paid_policy = null;
let license = null;
let activation = null;

test("init", function () {
    expect(keygen).toBeInstanceOf(Keygen);
    expect(keygen.account_id).toBe(account_id);
});

test("create token", async function () {
    token = await keygen.createToken(user_email, user_password);
    expect(token).toBeInstanceOf(Object);
    expect(token.id.length).toBeGreaterThan(0);
    expect(token.attributes.kind).toBe("admin-token");
    expect(token.attributes.token.length).toBeGreaterThan(0);
    expect(token.attributes.expiry).toBe(null);
});

test("create product", async function () {
    expect(token).toBeInstanceOf(Object);
    product = await keygen.createProduct(token.attributes.token, {
        "name": "HyperTyper"
    });
    expect(product).toBeInstanceOf(Object);
    expect(product.id.length).toBeGreaterThan(0);
    expect(product.type).toBe("products");
    expect(product.attributes.name).toBe("HyperTyper");
});

test("list products", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);

    const products = await keygen.getProducts(token.attributes.token);
    expect(products).toBeInstanceOf(Array);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].attributes.name).toBe("HyperTyper");
});

test("create paid policy", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    const policy = Object.assign({}, Keygen.PAID_POLICY);
    policy.maxMachines = 1;
    paid_policy = await keygen.createPolicy(token.attributes.token, product.id, policy);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(paid_policy.id.length).toBeGreaterThan(0);
    expect(paid_policy.type).toBe("policies");
    expect(paid_policy.attributes.name).toBe(policy.name);
    expect(paid_policy.attributes.duration).toBe(policy.duration);
    expect(paid_policy.attributes.max_machines).toBe(policy.max_machines);
    expect(paid_policy.attributes.machineUniquenessStrategy).toBe(policy.machineUniquenessStrategy);
    expect(paid_policy.attributes.floating).toBe(policy.floating);
});

test("list policies", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    const policies = await keygen.getPolicies(token.attributes.token, product.id);
    expect(policies).toBeInstanceOf(Array);
    expect(policies.length).toBe(1);
    expect(policies[0].id.length).toBeGreaterThan(0);
    expect(policies[0].type).toBe("policies");
    expect(policies[0].attributes.name).toBe(Keygen.PAID_POLICY.name);
    expect(policies[0].attributes.duration).toBe(Keygen.PAID_POLICY.duration);
    expect(policies[0].attributes.max_machines).toBe(Keygen.PAID_POLICY.max_machines);
    expect(policies[0].attributes.machineUniquenessStrategy).toBe(Keygen.PAID_POLICY.machineUniquenessStrategy);
    expect(policies[0].attributes.floating).toBe(Keygen.PAID_POLICY.floating);
});

test("create license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);

    license = await keygen.createLicense(token.attributes.token, paid_policy.id, {
        email: "test@themaximalist.com"
    });
    expect(license).toBeInstanceOf(Object);
    expect(license.id.length).toBeGreaterThan(0);
    expect(license.type).toBe("licenses");
    expect(license.attributes.key.length).toBeGreaterThan(0);
    expect(license.attributes.expiry).toBe(null);
    expect(license.attributes.status).toBe("ACTIVE");
    expect(license.attributes.uses).toBe(0);
    expect(license.attributes.metadata.email).toBe("test@themaximalist.com");
});

test("invalid license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);

    const validation = await keygen.validateLicense("invalid-key");
    expect(validation).toBeInstanceOf(Object);
    expect(validation.valid).toBe(false);
    expect(validation.code).toBe("NOT_FOUND");
});

test("validate license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);

    const validation = await keygen.validateLicense(license.attributes.key);
    expect(validation).toBeInstanceOf(Object);
    expect(validation.valid).toBe(true);
    expect(validation.code).toBe("VALID");
});

test("activate license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);

    activation = await keygen.activateLicense(token.attributes.token, license.id);
    expect(activation).toBeInstanceOf(Object);
    expect(activation.id.length).toBeGreaterThan(0);
    expect(activation.type).toBe("machines");
    expect(activation.attributes.fingerprint.length).toBeGreaterThan(0);
});

test("exceed maxMachines", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);

    keygen.machine_id = "new-machine-id";
    const failedActivation = keygen.activateLicense(token.attributes.token, license.id);
    expect(failedActivation).rejects.toThrow("machine count");
});

test("deactivate license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);
    expect(activation).toBeInstanceOf(Object);

    keygen.machine_id = activation.attributes.fingerprint;
    const deactivation = await keygen.deactivateLicense(token.attributes.token, activation.id);
    expect(deactivation).toBeInstanceOf(Object);
});

test("reactivate license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(license).toBeInstanceOf(Object);

    keygen.machine_id = activation.attributes.fingerprint;
    const reactivation = await keygen.activateLicense(token.attributes.token, license.id);
    expect(reactivation).toBeInstanceOf(Object);
    expect(reactivation.id.length).toBeGreaterThan(0);
    expect(reactivation.type).toBe("machines");
    expect(reactivation.attributes.fingerprint.length).toBeGreaterThan(0);
});

test("delete license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);

    const license1 = await keygen.createLicense(token.attributes.token, paid_policy.id, {
        email: "test1@themaximalist.com"
    });

    const license2 = await keygen.createLicense(token.attributes.token, paid_policy.id, {
        email: "test2@themaximalist.com"
    });

    let licenses;
    licenses = await keygen.getLicenses(token.attributes.token, product.id);
    expect(licenses.length).toBe(3);

    await keygen.deleteLicense(token.attributes.token, license1.id);

    licenses = await keygen.getLicenses(token.attributes.token, product.id);
    expect(licenses.length).toBe(2);

    await keygen.validateLicense(token.attributes.token, license2.id);

    try {
        await keygen.validateLicense(token.attributes.token, license2.id);
        expect.fail("should have been deleted");
    } catch (e) {
        expect(e).toBeInstanceOf(Error);
    }
});
