/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormPandit } from '../models/FormPandit';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FormPanditService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPandit(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFormPandit({
        requestBody,
    }: {
        requestBody?: FormPandit,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/FormPandit',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPanditPaged({
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
            url: '/api/FormPandit/paged',
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
    public static getApiFormPandit1({
        rollNo,
        sessionNo,
    }: {
        rollNo: number,
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit/{rollNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFormPandit({
        rollNo,
        sessionNo,
        requestBody,
    }: {
        rollNo: number,
        sessionNo: number,
        requestBody?: FormPandit,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/FormPandit/{rollNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'sessionNo': sessionNo,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFormPandit({
        rollNo,
        sessionNo,
    }: {
        rollNo: number,
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/FormPandit/{rollNo}/{sessionNo}',
            path: {
                'rollNo': rollNo,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPanditSession({
        sessionNo,
    }: {
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit/session/{sessionNo}',
            path: {
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPanditUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPanditCentre({
        centreCode,
    }: {
        centreCode: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit/centre/{centreCode}',
            path: {
                'centreCode': centreCode,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormPanditName({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormPandit/name/{name}',
            path: {
                'name': name,
            },
        });
    }
}
