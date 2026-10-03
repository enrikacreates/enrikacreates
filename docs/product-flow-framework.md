# Product flow framework

The shape every case study in this portfolio is built against.

Nine stages, in four groups. The point is not that every app has all nine. The
point is that every app can be *asked* about all nine, and that a stage left out
on purpose is a design decision worth stating rather than a hole worth hiding.

Used consistently, this is what makes the portfolio read as a way of working
rather than as nine unrelated apps. A hiring manager comparing two projects can
put the two Loop diagrams side by side and see the same thinking applied to
different problems.

---

## Get them in

### 1. Reach
How a stranger hears about this and what they land on. Public pages, the pitch,
the proof. Everything reachable without an account.

Asks: what does someone believe about this before they commit anything?

### 2. Enroll
The commitment moment. Invite, signup, payment, waitlist. Whatever converts a
visitor into someone with a record in the database.

Asks: what is the smallest commitment that still means something?

---

## Get them going

### 3. First Run
Login, welcome, orientation. The first thing seen with an account attached.
This is teaching: what is this place, who else is here, what happens next.

Asks: can someone tell what this is for within one screen?

### 4. Setup
The essentials the *system* needs before it can do its job. Profile fields,
preferences, connections, imports.

Deliberately separate from First Run, and the distinction is load-bearing.
Onboarding is orientation, aimed at the person. Setup is fuel, aimed at the
product. They have different success measures: orientation succeeds when
someone understands, setup succeeds when the system has enough signal to
behave well. Collapsing them produces a chore screen wearing a welcome hat.

Asks: what does the product genuinely need, and what is being asked for out of
habit?

### 5. First Win
**The first time someone gets the thing they came for.**

Its own stage, because it is neither of its neighbours. First Run is
orientation. The Loop is habit. This is the one-time proof that the promise was
real, and it is where products die.

It is also where design decisions are most visible, so it is the stage worth
the most space in a case study. The best question to ask of any product is:
what is the shortest honest path to the first real win? Shortest, because every
screen before it is a chance to leave. Honest, because a manufactured win
(a confetti burst for filling in a text field) buys nothing and costs trust.

A First Win is usually: something made, something shared, something received
from another person, or something understood that was not understood before.
It is almost never: an account created, a form completed, or a tour finished.

Asks: what is the first moment this was worth it, and how many steps away is it?

---

## Keep them

### 6. Home Base
The everyday landing. Where a returning member starts, and what the product
chooses to put in front of them.

Asks: what does this surface say is important? Does that match the Loop?

### 7. The Loop
The core recurring value cycle. The reason the product exists.

Draw it closed if it closes. Most good products have a genuine cycle rather
than a line, and drawing a cycle as a line misrepresents the thing.

Asks: what is the smallest complete turn of this loop, and what carries someone
from the end of one turn into the start of the next?

### 8. Return
What brings someone back next week. Cadence, notifications, streaks, standing
appointments, things that accumulate.

Separate from Champion, which is the other half of growth and a different job.
Return is about the existing member coming back. It has its own surfaces and its
own failure mode, which is nagging.

Asks: what is the rhythm, and who sets it, the product or the person?

---

## Grow through them

### 9. Champion
What makes a member bring someone else. Referral, invites, peer recruitment,
public artefacts that travel.

Asks: what does someone get out of bringing a person in, beyond altruism?

---

## Skipped stages

Say so, and say why. A personal tool has no Champion stage and should not have
one. A free tool has no payment step in Enroll. Naming a skipped stage as a
decision reads as judgement; padding it reads as filler.

---

## Worked example: Create Space Collective

> **A tool to do the work, not just a place to connect.**

That line is the hook the whole product is built against, and it is the reason
the stages below land where they do. A place to connect would put the rooms at
the centre and measure conversation. A tool to do the work puts the loop at the
centre and measures work leaving the building. Every call in this mapping, the
First Win being a post rather than a tour, shipping having two ranges, support
being the flywheel rather than the destination, falls out of it.

Mapped against the shipped app as of 2026-10-03, not against the plan.

| Stage | Where it lives |
|---|---|
| Reach | `/`, `/our-story`, `/values`, `/celebrate`, all public |
| Enroll | Request an invite (Tally), `/signup`, `/account/invite`, `/account/billing` |
| First Run | `/login`, then the welcome modal: personal video, one next step, confetti |
| Setup | Profile completion across avatar, bio, location, interests. `ProfileNudgeModal` on the dashboard, hidden at 100% |
| **First Win** | **Your first post, by any door. Built, but not placed at arrival. See below.** |
| Home Base | `/home`, "Hi, Enrika" over a WHERE TO NEXT list |
| The Loop | `/challenges` join, `/living-room` weekly check-in, `/made-it-wall` ship, `/show-and-tell` support, back to check-in |
| Return | The weekly cadence itself. The Living Room is dated by week and the check-in prompt rotates. Notifications with per-member modes |
| Champion | Welcome committee: existing members are notified to greet a newcomer, matched on shared profile signal |

### The finding

**Create Space has no First Win stage, and the dashboard shows where it went.**

The WHERE TO NEXT list offers: step into a space, watch the walkthrough, see
what's happening. All three are orientation. None of them is the thing the
product is for, and the landing page promises that thing in its first sentence.

The profile fill is correctly placed as Setup, and the Loop is strong once
someone is in it. The missing piece is the bridge.

**The First Win is the first post, by any door.** Weekly check-in, Daily Do,
work log, ask for help, what I'm shipping this week. Anything that lands in the
Living Room counts.

Two things make that the right definition rather than a lenient one.

It does not require having finished anything. An earlier draft of this put the
win at "make something and check I made it", which quietly demands that a
day-one member already have work to show. **Ask for help** as a valid first win
is the move: someone who has made nothing at all, who is stuck, which is often
exactly why they joined, can still cross the line on day one. A definition that
excludes the people most in need of the product is the wrong definition.

And the win produces a response. A post in the Living Room is seen, and
answered, by other members. The reward is not a confetti burst the product
hands you for completing a form, it is another person showing up. That is the
actual promise of the place, delivered once, early, as proof.

**What this changes about the work.** Every door already exists and every one
already lands in the Living Room. The gap is placement, not capability: nothing
new needs building, something existing needs moving to the front. That is a
different and far cheaper piece of work than the earlier reading implied, which
is the practical reason to get the definition right before estimating anything.

That is a design recommendation, not a defect report. The app works. It just
hands people the map before it hands them the first thing worth doing.

---

## How this feeds a case study

On a project detail page:

- **`keyScreens`**, the strip above the written story, carries the Loop. Two or
  three screens, because the Loop is what the product *is*.
- **`process`**, the stepped story below, carries the stages that involved a real
  decision. Not all nine. The ones where something was chosen, and where the
  thing chosen can be shown.
- The two diagrams, Onboarding and the Loop, sit with their stage. Supporting
  features attach as light branches off the step they serve, so the feature set
  reads as derived from the flow rather than accumulated next to it.
