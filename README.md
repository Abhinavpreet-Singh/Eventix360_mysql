# Eventix360

A web app for managing college events, clubs, and registrations. Allows clubs
and admins to create/manage events, students to browse and register.

## Problem Context

- Scattered announcements across multiple channels.
- Manual registrations causing duplication.
- Lack of centralized records and oversight.

## Vision of the System

- Unified platform for students to browse/register, clubs to manage events, and
  admins to oversee operations.
- Relational database ensuring consistency, integrity, and security.

## Core Objectives

- Centralized event portal with role-based access.
- Secure registrations and feedback collection.
- Normalized database supporting efficient querying and transactions.

## System Users and Roles

- **Students**: Browse, register, provide feedback.
- **Clubs**: Create/manage events, view registrations/feedback.
- **Super Admins**: Oversee clubs, categories, and system data.

## System Modules and Features

- **Event Management**: CRUD operations with details and media.
- **Registration**: Automated confirmations and participant lists.
- **Feedback**: Ratings/comments linked to users/events.
- **Categories**: Predefined groupings (Tech, Cultural, etc.).
- **Payments**: Transaction simulation.
- **Logging**: Trigger-based activity tracking.

## Database Design Philosophy

- Relational model with entities (Users, Clubs, Events, etc.) and relationships.
- Normalization to BCNF, foreign keys, constraints, and triggers.
- 9 normalized tables with transaction support.

## Scope of the Project

- End-to-end event workflows from creation to feedback.
- Demonstrates DDL/DML, joins, views, procedures, triggers, and security.

## Team Contribution Summary

- **Abhinavpreet Singh Arora**: Schema, normalization, triggers, ER modeling.
- **Dhruv Kumar Aggarwal**: Use cases, advanced queries, procedures.
- **Pratham Mittal**: Optimization, payments, reports.

## Tech Stack

- Frontend: React, Vite, TailwindCSS, Axios
- Backend: Node.js, Express, MySQL, JWT, bcrypt
- Database: MySQL

## Quick Start

1. Install: `cd Backend; npm install; cd ..; npm install`
2. Setup DB: Apply `Backend/src/eventix.sql`
3. Run: Backend `cd Backend; npm run dev`, Frontend `npm run dev`

## Conclusion

Eventix 360 is a scalable event management platform with strong DBMS
foundations, enabling efficient operations and demonstrating advanced database
concepts.
