/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormPrathamik } from '../models/FormPrathamik';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FormPrathamikService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamik(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFormPrathamik({
        requestBody,
    }: {
        requestBody?: FormPrathamik,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/FormPrathamik',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikPaged({
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
            url: '/api/FormPrathamik/paged',
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
    public static getApiFormPrathamik1({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFormPrathamik({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: FormPrathamik,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/FormPrathamik/{id}',
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
    public static deleteApiFormPrathamik({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/FormPrathamik/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikCentre({
        centreCode,
    }: {
        centreCode: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/centre/{centreCode}',
            path: {
                'centreCode': centreCode,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikName({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/name/{name}',
            path: {
                'name': name,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikSession({
        sessionNo,
    }: {
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/session/{sessionNo}',
            path: {
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPrathamikRegion({
        regionNo,
    }: {
        regionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPrathamik/region/{regionNo}',
            path: {
                'regionNo': regionNo,
            },
        });
    }
}
