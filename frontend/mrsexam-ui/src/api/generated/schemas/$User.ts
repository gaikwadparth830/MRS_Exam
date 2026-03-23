/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $User = {
    properties: {
        userId: {
            type: 'string',
            isRequired: true,
            maxLength: 10,
            minLength: 1,
        },
        password: {
            type: 'string',
            isNullable: true,
            maxLength: 10,
        },
        userKey: {
            type: 'string',
            isNullable: true,
            maxLength: 5,
        },
    },
} as const;
