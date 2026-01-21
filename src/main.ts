import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Hair Style Virtual Try-on + Salon Booking API')
    .setDescription(`
      ## Complete API for Hair Salon Booking & AI Hairstyle Try-on Platform (Sri Lanka)

      ### Features:
      - 🔐 **Authentication**: JWT-based authentication with user roles
      - 💇 **Salon Management**: Complete salon registration, search, and filtering
      - 📅 **Booking System**: Real-time appointment booking with slot availability
      - 🤖 **AI Try-on**: Hairstyle virtual try-on powered by Gemini 2.5 Flash
      - ⭐ **Reviews**: Customer reviews and ratings with before/after photos
      - 💳 **Payments**: Multiple payment methods (Card, Bank, LankaQR, Cash)
      - 🎁 **Promotions**: Discount codes and promotional campaigns
      - 📊 **Subscriptions**: Tiered subscription plans for customers and salons
      - 🔔 **Notifications**: SMS/WhatsApp/Email notifications

      ### Subscription Tiers:
      **Customers:**
      - FREE: 5 try-ons/week + unlimited booking
      - PLUS: LKR 990/month (80 try-ons/month, no ads)
      - PRO: LKR 1,990/month (250 try-ons/month, style packs)

      **Salons:**
      - STARTER: Free (basic listing)
      - GROWTH: LKR 2,500/month (calendar, promo tools)
      - PRO: LKR 6,500/month (multi-staff, analytics)

      ### Base URL:
      - Development: http://localhost:3000
      - Production: https://api.yourdomain.com
    `)
    .setVersion('1.0.0')
    .setContact(
      'Hair App Support',
      'https://yourwebsite.com',
      'support@yourcompany.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User registration, login, and JWT authentication')
    .addTag('Users', 'User profile management and account settings')
    .addTag('Salons', 'Salon registration, search, and management')
    .addTag('Bookings', 'Appointment booking and scheduling')
    .addTag('AI Try-on', 'AI-powered hairstyle virtual try-on')
    .addTag('Reviews', 'Customer reviews and ratings')
    .addTag('Payments', 'Payment processing and transaction history')
    .addTag('Subscriptions', 'Subscription plan management')
    .addTag('Promotions', 'Promotional campaigns and discount codes')
    .addTag('Portfolio', 'Salon portfolio and before/after galleries')
    .addTag('Notifications', 'Notification management')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.yourdomain.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Hair App API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
