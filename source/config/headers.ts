const validateHeaders = (token: any) => {
    if (token === process.env.authToken) return false;
    else return true;
};

export default validateHeaders;
