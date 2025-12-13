import { NestFactory } from "@nestjs/core";
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { env } from "./env";

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
		{ cors: { methods } },
	);
	await app.listen(env.PORT);
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
