import Keygen from "./index.js";
import dotenv from "dotenv-extended";
dotenv.load();

import inquirer from "inquirer";

async function prompt(message) {
    const { answer } = await inquirer.prompt([{ message, name: 'answer' }]);
    return answer;
}

const account_id = process.env.KEYGEN_ACCOUNT_ID || await prompt("Account ID");
const user_email = process.env.KEYGEN_ACCOUNT_EMAIL || await prompt("Email");
const user_password = process.env.KEYGEN_ACCOUNT_PASSWORD || await prompt("Password");

console.log("INITIALIZING");
const keygen = new Keygen({ account_id, ignore_ssl: true });

console.log("CREATING API KEY");
const token = await keygen.createToken(user_email, user_password);
const api_key = token.attributes.token;
console.log("CREATED API KEY", api_key);


console.log("CREATING PRODUCT");
const product = await keygen.createProduct(api_key, {
    "name": await prompt("Product name")
});
console.log("CREATED PRODUCT", product.attributes.name, product.id);

console.log("CREATING PAID POLICY");
const policy = await keygen.createPolicy(api_key, product.id, Keygen.PAID_POLICY);
console.log("CREATED PAID POLICY", policy.id);

console.log("\n\n-------------------- FINISHED --------------------");
console.log(`ACCOUNT_ID: ${account_id}`);
console.log(`API_KEY: ${api_key}`);
console.log(`PRODUCT_NAME: ${product.attributes.name}`);
console.log(`PRODUCT_ID: ${product.id}`);
console.log(`PAID_POLICY_ID: ${policy.id}`);
console.log("-------------------- FINISHED --------------------\n\n");