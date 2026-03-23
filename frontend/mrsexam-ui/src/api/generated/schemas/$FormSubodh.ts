/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $FormSubodh = {
    properties: {
        srNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        rollNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        regionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        name: {
            type: 'string',
            isNullable: true,
            maxLength: 60,
        },
        sessionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        gender: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        formCentre: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        examCentre: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        marks1: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        marks2: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        totMarks: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        grade: {
            type: 'string',
            isNullable: true,
            maxLength: 10,
        },
        undFlag: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        undClass: {
            type: 'string',
            isNullable: true,
            maxLength: 6,
        },
        specialRank: {
            type: 'string',
            isNullable: true,
            maxLength: 20,
        },
        result: {
            type: 'string',
            isNullable: true,
            maxLength: 20,
        },
        dummyCentreCode: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        resgenRun: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        userId: {
            type: 'string',
            isNullable: true,
            maxLength: 15,
        },
    },
} as const;
