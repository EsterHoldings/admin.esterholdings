export const tradingMenuRoutes = (activeLink, t) => {
    return {
        [t(`landing.header.megaMenu.${activeLink}[0].section`)]: {
            path: "account-overview?index=0",
            list: [
                "account-overview?index=0",
                "account-overview?index=1",
                "account-overview?index=2",
                "account-overview?index=3",
            ],
        },
        [t(`landing.header.megaMenu.${activeLink}[1].section`)]: {
            path: "market-instruments?index=0",
            list: [
                "market-instruments?index=0",
                "market-instruments?index=1",
                "market-instruments?index=2",
                "market-instruments?index=3",
                "market-instruments?index=4",
                "market-instruments?index=5",
                "market-instruments?index=6",
            ],
        },

        [t(`landing.header.megaMenu.${activeLink}[2].section`)]: {
            path: "platform",
            list: ["mt-4", "#"],
        },

        [t(`landing.header.megaMenu.${activeLink}[3].section`)]: {
            path: "trading-conditions",
            list: ["/account-replenishment", "/withdrawal-of-funds"],
        },

        [t(`landing.header.megaMenu.${activeLink}[4].section`)]: {
            path: "trader's-hub",
            list: ["/trader's-blog", "/economic-calendar", "/market-news"],
        },

        [t(`landing.header.megaMenu.${activeLink}[5].section`)]: {
            path: "tandem-trading",
            list: ["/for-trader", "/for-investor"],
        },
    };
};
