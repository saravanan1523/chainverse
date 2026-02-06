### ChainVerse Setup Instructions

Thank you for choosing ChainVerse! Follow these steps to get your platform running:

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)

## Installation & Setup

1. **Install Dependencies** (already done)
   ```bash
   npm install
   ```

2. **Set Up Database**
   
   Update `.env.local` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   ```
   This will create all tables in your database.

4. **Add OpenAI API Key** (for AI Assistant)
   
   Add to `.env.local`:
   ```
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Create an Account**
   - Navigate to `/register`
   - Choose your role (Individual, Company Admin, or Employee)
   - Fill in your profile details

2. **Explore the Platform**
   - **Ops Feed**: Case studies, SOPs, insights, and incidents
   - **People Feed**: Celebrations and career updates
   - **Company Feed**: Company announcements and updates

3. **Create Your First Post**
   - Click "Create Post" button
   - Select post type
   - Share your knowledge!

## Database Schema

The platform includes:
- **Users** with role-based access (Individual, Company Admin, Employee, Platform Admin)
- **Companies** with verified badges
- **Posts** with 6 types (Celebration, Insight, Case Study, SOP, Incident, Company Update)
- **Comments** and **Reactions** (Like & Save)
- **AI Queries** tracking
- **Subscriptions** for premium features

## Features Implemented

✅ Email/Password Authentication
✅ Role-Based User System
✅ Three-Feed System (Ops, People, Company)
✅ Post Creation with Templates
✅ Comments & Reactions
✅ AI Assistant (ChainAI)
✅ Company Profiles
✅ User Profiles
✅ Microsoft Fluent UI Design

## What's Next?

- Set up your company profile (if you're a Company Admin)
- Invite team members
- Start sharing operational knowledge
- Use the AI Assistant for supply chain insights

## Support

For issues or questions, refer to the API documentation in `/app/api/`.

---

**Built with:**
- Next.js 16
- TypeScript
- Prisma + PostgreSQL
- Microsoft Fluent UI
- NextAuth.js
- OpenAI API
