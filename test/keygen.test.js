// CREATE PRODUCT
// CREATE LICENSE
// VALIDATE LICENSE
// ACTIVATE MACHINE
// TRIAL -> PAID conversion
// DEMO SCRIPT

import { test, expect } from "vitest";
import Keygen from "../src/index.js";
import dotenv from "dotenv-extended";
dotenv.load();

const account_id = process.env.KEYGEN_ACCOUNT_ID;
const user_email = process.env.KEYGEN_ACCOUNT_EMAIL;
const user_password = process.env.KEYGEN_ACCOUNT_PASSWORD;

test("init", function () {
    const keygen = new Keygen({ account_id });
    expect(keygen).toBeInstanceOf(Keygen);
    expect(keygen.account_id).toBe(account_id);
});

test("create token", async function () {
    const keygen = new Keygen({ account_id, ignore_ssl: true });
    const token = await keygen.createToken(user_email, user_password);
    expect(token).toBeInstanceOf(Object);
    expect(token.id.length).toBeGreaterThan(0);
    expect(token.attributes.kind).toBe("admin-token");
    expect(token.attributes.token.length).toBeGreaterThan(0);
    expect(token.attributes.expiry).toBe(null);
});

test("create product", async function () {
    const keygen = new Keygen({ account_id, ignore_ssl: true });
    const token = await keygen.createToken(user_email, user_password);
    const key = token.attributes.token;
    expect(key.length).toBeGreaterThan(0);

    const product = await keygen.createProduct(key, {
        "name": "HyperTyper"
    });
    expect(product).toBeInstanceOf(Object);
    expect(product.id.length).toBeGreaterThan(0);
    expect(product.type).toBe("products");
    expect(product.attributes.name).toBe("HyperTyper");
});