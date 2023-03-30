"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersClient = exports.ordersMethods = exports.ordersPath = void 0;
exports.ordersPath = 'orders';
exports.ordersMethods = ['find', 'get', 'create', 'patch', 'remove'];
const ordersClient = (client) => {
    const connection = client.get('connection');
    client.use(exports.ordersPath, connection.service(exports.ordersPath), {
        methods: exports.ordersMethods
    });
};
exports.ordersClient = ordersClient;
