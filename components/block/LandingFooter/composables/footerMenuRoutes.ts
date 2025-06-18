export const footerMenuRoutes = () => {
  return {
    trading: [
      { labelKey: "landing.footer.trading.items[0]", path: "account-overview" },
      {
        labelKey: "landing.footer.trading.items[1]",
        path: "market-instruments",
      },
      { labelKey: "landing.footer.trading.items[2]", path: "platform" },
      { labelKey: "landing.footer.trading.items[3]", path: "trading-term" },
      { labelKey: "landing.footer.trading.items[4]", path: "tandem-trading" },
    ],
    partnership: [
      { labelKey: "landing.footer.partnership.items[0]", path: "register-ib" },
      {
        labelKey: "landing.footer.partnership.items[1]",
        path: "generate-income",
      },
    ],
    company: [
      { labelKey: "landing.footer.company.items[0]", path: "about-company" },
      { labelKey: "landing.footer.company.items[1]", path: "documents" },
      { labelKey: "landing.footer.company.items[2]", path: "company-news" },
      { labelKey: "landing.footer.company.items[3]", path: "contacts" },
      { labelKey: "landing.footer.company.items[4]", path: "career" },
    ],
  };
};
