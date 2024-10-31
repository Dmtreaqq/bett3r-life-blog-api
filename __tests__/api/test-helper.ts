import {app} from "../../src/app";
import {agent} from 'supertest'

export const request = agent(app)

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}