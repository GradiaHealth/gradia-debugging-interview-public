#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import RedirectTableStack from "./redirect-table-stack";

const app = new cdk.App();

new RedirectTableStack(app, "InterviewRedirectTableStackDEV", {
  stage: "DEV",
});
