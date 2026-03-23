/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormPraveshika } from '../models/FormPraveshika';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FormPraveshikaService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshika(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFormPraveshika({
        requestBody,
    }: {
        requestBody?: FormPraveshika,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/FormPraveshika',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaPaged({
        pageNumber = 1,
        pageSize = 50,
        sessionNo,
    }: {
        pageNumber?: number,
        pageSize?: number,
        sessionNo?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/paged',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshika1({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFormPraveshika({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: FormPraveshika,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/FormPraveshika/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFormPraveshika({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/FormPraveshika/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaCentre({
        centreCode,
    }: {
        centreCode: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/centre/{centreCode}',
            path: {
                'centreCode': centreCode,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaName({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/name/{name}',
            path: {
                'name': name,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaSession({
        sessionNo,
    }: {
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/session/{sessionNo}',
            path: {
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPraveshikaRegion({
        regionNo,
    }: {
        regionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPraveshika/region/{regionNo}',
            path: {
                'regionNo': regionNo,
            },
        });
    }
}
