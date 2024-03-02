// CREATE LICENSE
// VALIDATE LICENSE
// ACTIVATE MACHINE
// TRIAL -> PAID conversion
// DEFAULT POLICIES (TRIAL/PAID)
// DEMO SCRIPT

// CLIENT SIDE VERSION that doesn't have admin token

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
let trial_policy = null;
let paid_policy = null;

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

test("create trial policy", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    trial_policy = await keygen.createPolicy(token.attributes.token, product.id, Keygen.TRIAL_POLICY);
    expect(trial_policy).toBeInstanceOf(Object);
    expect(trial_policy.id.length).toBeGreaterThan(0);
    expect(trial_policy.type).toBe("policies");
    expect(trial_policy.attributes.name).toBe(Keygen.TRIAL_POLICY.name);
    expect(trial_policy.attributes.duration).toBe(Keygen.TRIAL_POLICY.duration);
    expect(trial_policy.attributes.max_machines).toBe(Keygen.TRIAL_POLICY.max_machines);
    expect(trial_policy.attributes.machineUniquenessStrategy).toBe(Keygen.TRIAL_POLICY.machineUniquenessStrategy);
});

test("create paid policy", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    paid_policy = await keygen.createPolicy(token.attributes.token, product.id, Keygen.PAID_POLICY);
    expect(paid_policy).toBeInstanceOf(Object);
    expect(paid_policy.id.length).toBeGreaterThan(0);
    expect(paid_policy.type).toBe("policies");
    expect(paid_policy.attributes.name).toBe(Keygen.PAID_POLICY.name);
    expect(paid_policy.attributes.duration).toBe(Keygen.PAID_POLICY.duration);
    expect(paid_policy.attributes.max_machines).toBe(Keygen.PAID_POLICY.max_machines);
    expect(paid_policy.attributes.machineUniquenessStrategy).toBe(Keygen.PAID_POLICY.machineUniquenessStrategy);
    expect(paid_policy.attributes.floating).toBe(Keygen.PAID_POLICY.floating);
    // expect(paid_policy.attributes.transferStrategy).toBe(Keygen.PAID_POLICY.transferStrategy); // TODO: bugged or works as expected?
});

test("create license", async function () {
    expect(token).toBeInstanceOf(Object);
    expect(product).toBeInstanceOf(Object);
    expect(trial_policy).toBeInstanceOf(Object);
    expect(paid_policy).toBeInstanceOf(Object);

    // const key = token.attributes.token;
    const license = await keygen.createLicense(token.attributes.token, trial_policy.id, {
        user: "test@themaximalist.com"
    });
    expect(license).toBeInstanceOf(Object);
    expect(license.id.length).toBeGreaterThan(0);
    expect(license.type).toBe("licenses");
    expect(license.attributes.key.length).toBeGreaterThan(0);
    expect(license.attributes.expiry).not.toBe(null);
    expect(license.attributes.status).toBe("ACTIVE");
    expect(license.attributes.uses).toBe(0);
});