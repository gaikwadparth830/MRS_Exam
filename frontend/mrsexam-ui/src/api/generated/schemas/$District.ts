/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $District = {
    properties: {
        districtName: {
            type: 'string',
            isRequired: true,
            maxLength: 50,
            minLength: 1,
        },
        regionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        districtCity: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        shortName: {
            type: 'string',
            isNullable: true,
            maxLength: 10,
        },
        seatDistrictNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
    },
} as const;
