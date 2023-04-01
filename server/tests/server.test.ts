import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import { describe, it } from "mocha";
import server from "../src/server";

chai.use(chaiHttp);

describe("/ping", () => {
  it("happy case", async () => {
    const res = await chai.request(server).get("/ping");
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('ping');
  });
});
