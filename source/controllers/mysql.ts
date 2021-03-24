import { Connect, Query } from '../config/mysql';

const queryDb = async (query: string) => {
    Connect()
        .then((connection) => {
            Query(connection, query)
                .then((result: any) => {
                    return {
                        status: 1,
                        message: 'Invalid email or password',
                        result: result
                    };
                })
                .catch((error) => {

                    return {
                        status: 0,
                        message: error.message,
                        error
                    };
                })
                .finally(() => {
                    connection.end();
                });
        })
        .catch((error) => {
            return {
                status: 0,
                message: error.message,
                error
            };
        });

}

export default { queryDb }