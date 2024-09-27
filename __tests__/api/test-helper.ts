import {app} from "../../src/app";
import {agent} from 'supertest'

export const request = agent(app)