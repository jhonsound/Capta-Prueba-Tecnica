// infrastructure/lib/infrastructure-stack.ts

import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import lambda from "../../src/lambda";

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define la función Lambda usando NodejsFunction.
    // Automáticamente compila tu TS, empaqueta node_modules y lo sube.
    const apiFunction = new NodejsFunction(this, "BusinessDatesApiFunction", {
  entry: "src/lambda.ts", // Ruta relativa desde infrastructure/
      handler: "handler", // La función exportada en lambda.ts
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });

    // Crea un API Gateway que actúa como endpoint HTTP para tu función.
    const api = new LambdaRestApi(this, "BusinessDatesApiEndpoint", {
      handler: apiFunction,
      proxy: true, // Todas las peticiones (ej. /api/calculate) se pasan a la Lambda
    });

    // Imprime la URL del API en la consola al terminar el despliegue.
    new CfnOutput(this, "ApiUrl", {
      value: api.url,
    });
  }
}
