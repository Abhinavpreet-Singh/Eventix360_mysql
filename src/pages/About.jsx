const About = () => {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">About Eventix 360</h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Eventix 360 is a college events platform to discover, register and
        manage events — hackathons, workshops, club activities, and more. This
        is a demo site for showcasing event listing features, clubs, and admin
        tools.
      </p>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Built with a React frontend and a Node/Express + MySQL backend. Use the
        Admin portal to add events and clubs.
      </p>
    </section>
  );
};

export default About;
