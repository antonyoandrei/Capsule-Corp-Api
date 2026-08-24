const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");

const server = express();
const databasePath = path.resolve(__dirname, "..", "db.json");
const database = JSON.parse(fs.readFileSync(databasePath, "utf8"));
const resources = ["clothes", "items"];

const getCollection = resource => database[resource] || [];

const sendCollection = resource => (request, response) => {
  const query = typeof request.query.q === "string" ? request.query.q.trim().toLowerCase() : "";
  const page = Math.max(Number(request.query._page) || 1, 1);
  const requestedLimit = Number(request.query._limit);
  const collection = getCollection(resource).filter(product => !query || `${product.name} ${product.description}`.toLowerCase().includes(query));
  const limit = requestedLimit > 0 ? Math.min(requestedLimit, 100) : collection.length || 1;
  const start = (page - 1) * limit;

  response.set("X-Total-Count", String(collection.length));
  response.status(200).json(requestedLimit > 0 || request.query._page ? collection.slice(start, start + limit) : collection);
};

const sendProduct = resourceParameter => (request, response) => {
  const resource = resourceParameter || request.params.resource;
  if (!resources.includes(resource)) {
    response.status(404).json({ error: "Resource not found" });
    return;
  }
  const product = getCollection(resource).find(item => Number(item.id) === Number(request.params.id));
  if (!product) {
    response.status(404).json({ error: "Product not found" });
    return;
  }
  response.status(200).json(product);
};

server.disable("x-powered-by");
server.use(cors({ exposedHeaders: ["X-Total-Count"] }));
server.use((_request, response, next) => {
  response.set("X-Content-Type-Options", "nosniff");
  response.set("Referrer-Policy", "no-referrer");
  next();
});
server.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok", products: resources.reduce((total, resource) => total + getCollection(resource).length, 0) });
});
server.get(["/clothes", "/api/clothes"], sendCollection("clothes"));
server.get(["/items", "/api/items"], sendCollection("items"));
server.get(["/clothes/:id", "/api/clothes/:id"], sendProduct("clothes"));
server.get(["/items/:id", "/api/items/:id"], sendProduct("items"));
server.get("/product/:resource/:id/show", sendProduct());
server.use((_request, response) => {
  response.status(404).json({ error: "Endpoint not found" });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0", () => {
    process.stdout.write(`Capsule Corp API listening on port ${port}\n`);
  });
}

module.exports = server;
