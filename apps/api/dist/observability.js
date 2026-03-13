"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupObservability = setupObservability;
const common_1 = require("@nestjs/common");
async function setupObservability(app) {
    const logger = new common_1.Logger("Observability");
    app.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
            const duration = Date.now() - start;
            logger.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
        });
        next();
    });
    logger.log("Observability setup complete");
}
//# sourceMappingURL=observability.js.map