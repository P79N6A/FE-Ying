export default {
    get(key: string) {
        const env = process.env.NODE_ENV;
        const defaultConfig = require('./default.ts').default;
        let config: any = {};
        if (env === 'development') {
            config = require('./development.ts').default;
        }
        if (env === 'production') {
            config = require('./production.ts').default;
        }
        return { ...defaultConfig, ...config }[key];
    },
};
