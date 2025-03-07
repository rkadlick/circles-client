# Circles Client

A web application inspired by Reddit, allowing users to create and join topic-based communities ("Circles") to share posts, engage in discussions, and upvote content.

## Features

- User authentication with Supabase
- Create, edit, and delete Circles
- Submit posts and interact with comments
- Upvote system for ranking posts
- Dynamic sorting options: "Hot," "New," and "Top"
- Responsive design for seamless mobile and desktop experience

## Tech Stack

- **Frontend:** React, TypeScript, Redux Toolkit
- **Backend:** Supabase (PostgreSQL, Authentication)
- **Styling:** CSS Modules
- **Routing:** React Router

## Installation

### Prerequisites
- Node.js (latest LTS recommended)
- npm or yarn
- Supabase project set up with relevant tables

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/rkadlick/circles-client.git
   cd circles-client
   ```
2. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
3. Create a `.env` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the development server:
   ```sh
   npm run dev  # or yarn dev
   ```

## Usage

- Sign up or log in to access full functionality.
- Browse Circles and join discussions.
- Create a Circle to start a new community.
- Upvote posts to influence their ranking.

## Roadmap

- Implement real-time updates for posts and comments
- Add user profile customization
- Enhance moderation tools for Circle admins

## Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

## License

This project is licensed under the MIT License.

