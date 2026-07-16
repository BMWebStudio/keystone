# Architecture

The product is split into a Next.js/Supabase product layer and a framework-independent browser validator. The validator never requires React, Next.js, Supabase, or Webflow. Native HTML semantics are inferred first; optional `data-a11y-*` attributes customize messages and behavior.
