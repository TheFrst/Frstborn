// FRSTBORN life events. Each choice can have a check (ck) — "stat:offset" (or "main:offset", "tal:key:level").
// fx strings: "might+3 fame+10 gold-50 tal:illusion+8 tal:rand+8 energy-10 op+20 rep+5 injury:Broken arm:2 flag:x unflag:x friend partner kid trophy:🏆:Name weapon+1 armor+1 relic+1"
// Text placeholders: {N} you, {R} rival, {F} friend, {O} your Order, {G} your guild, {P} pet, {M} a monster, {Pa} partner, {T} a teacher
export const EVENTS = [
  // ===================== ACADEMY =====================
  { id: "bully", ph: "a", t: "Two older students have cornered a nervous first-year in the Moonstair corridor.", c: [
    { t: "💪 Step in and stop them", ck: "might:+0", ok: "might+2 op+15 friend", okT: "They back off. The first-year, {F}, follows you around for weeks after that. A friend for life.", no: "energy-20 injury:Bruised ribs:1", noT: "You get thrown down the stairs. Still, the first-year got away." },
    { t: "🧠 Trick them into leaving", ck: "wits:+0", ok: "wits+2 op+10", okT: "You shout that the Headmaster is coming. They run. Nobody suspects a thing.", no: "op-10", noT: "They see through it, and now they don't like you either." },
    { t: "🏃 Fetch a professor", ok: "spirit+1 op+5", okT: "{T} arrives and hands out detentions like sweets." } ] },
  { id: "tryout", ph: "a", once: true, if: C => !C.onTeam && C.schoolYear <= 4, t: "Skyball try-outs for {O}! Brooms, flying hoops and a ball that bites.", c: [
    { t: "🏹 Try out as Seeker", ck: "agility:+0", ok: "flag:team agility+2 op+10", okT: "You catch the Snapwing in eleven seconds. You're on the team!", no: "energy-15", noT: "You fall off your broom into the lake. Maybe next year." },
    { t: "💪 Try out as Keeper", ck: "might:+0", ok: "flag:team might+2 op+10", okT: "Nothing gets past you. You're on the team!", no: "energy-15 injury:Broken finger:1", noT: "The ball bites your hand. Hard." },
    { t: "No thanks", ok: "wits+1", okT: "You watch from the stands and study instead." } ] },
  { id: "forbidden", ph: "a", t: "Late at night you find a door in the Forbidden Wing, glowing with runes you can't read.", c: [
    { t: "🗝️ Pick the lock", ck: "agility:+5", ok: "tal:rand+14 op+0 fame+5", okT: "Inside: a dusty book of forgotten magic. You read it all night.", no: "op-25", noT: "Caught by the caretaker. Detention, and -25 points for {O}." },
    { t: "🔮 Read the runes", ck: "arcana:+5", ok: "tal:runecraft+12 arcana+2", okT: "The runes rearrange themselves for you. The door opens on its own.", no: "injury:Rune burns:1", noT: "The runes bite back. Your hands glow for a week." },
    { t: "Walk away", ok: "spirit+1", okT: "Some doors are best left shut. For now." } ] },
  { id: "duelnight", ph: "a", t: "{R} challenges you to a secret midnight duel in the Trophy Room.", c: [
    { t: "⚔️ Accept the duel", ck: "main:+0", ok: "main+2 fame+5 op+10", okT: "You win. {R} limps off swearing revenge.", no: "fame-3 energy-15", noT: "{R} wins, and makes sure everyone hears about it." },
    { t: "🎭 Refuse and laugh it off", ck: "charm:+0", ok: "charm+2", okT: "You make {R} look silly in front of everyone. No duel needed.", no: "fame-2", noT: "People whisper that you're scared." },
    { t: "Tell a prefect", ok: "op-5 spirit+1", okT: "{R} gets detention. Everyone knows it was you." } ] },
  { id: "lessons", ph: "a", t: "{T} noticed your talent and offers you private lessons after class.", c: [
    { t: "📖 Accept", ok: "tal:main+14 energy-10", okT: "Hours of extra practice. You can feel yourself getting better." },
    { t: "Learn something new", ok: "tal:rand+12 energy-10", okT: "{T} teaches you something nobody in your year knows." },
    { t: "Politely decline", ok: "energy+10", okT: "You need your sleep." } ] },
  { id: "egg", ph: "a", once: true, t: "A strange speckled egg hatches under your bed. Something small and scaly looks up at you.", c: [
    { t: "🐾 Keep it secret and raise it", ck: "spirit:+0", ok: "tal:beasttaming+14 flag:hatchling", okT: "It grows fast and follows you everywhere. You call it Ash.", no: "op-15 injury:Singed eyebrows:1", noT: "It sets your curtains on fire. A professor confiscates it." },
    { t: "Give it to the gamekeeper", ok: "spirit+2 op+10", okT: "The gamekeeper is delighted. {O} gets points for honesty." } ] },
  { id: "cheat", ph: "a", if: C => C.season === 2, t: "The day before exams, {F} slips you a scroll: the answers, stolen from the staff room.", c: [
    { t: "Use them", ck: "wits:+10", ok: "flag:cheated", okT: "Nobody notices. Your grades will be great… but it feels wrong.", no: "op-40 fame-10", noT: "The scroll is enchanted to scream when read. Everybody heard." },
    { t: "Burn it", ok: "spirit+2", okT: "You study the honest way, by candlelight." },
    { t: "Report it", ok: "op+15 spirit+1", okT: "The teachers change the exam. {F} is not very happy with you." } ] },
  { id: "ball", ph: "a", if: C => C.schoolYear >= 3 && C.season === 1, t: "The Winter Ball! Floating candles, an ice orchestra and dancing. Who do you go with?", c: [
    { t: "🤝 Go with {F}", ok: "charm+2 energy+10", okT: "Best night of the year. You laugh until 3am." },
    { t: "🎭 Ask your crush", ck: "charm:+5", ok: "charm+3 fame+5", okT: "They say YES. The whole school talks about you two.", no: "charm-1", noT: "They're going with {R}. Of course they are." },
    { t: "Skip it and train", ok: "tal:main+10", okT: "The training hall is empty and all yours." } ] },
  { id: "ghost", ph: "a", t: "A ghost in the library whispers a spell that was lost three hundred years ago.", c: [
    { t: "Listen closely", ck: "arcana:+0", ok: "tal:magic+14 arcana+1", okT: "You memorise it. It works!", no: "energy-20", noT: "The words slip away. You feel cold for a week." },
    { t: "Ask about the ghost's life", ok: "wits+2 tal:divination+8", okT: "She was a seer. She tells you a little about your future…" } ] },
  { id: "pranks", ph: "a", t: "A prank war breaks out between {O} and a rival Order. Toads in teapots, enchanted shoes…", c: [
    { t: "🌀 Plan the ultimate prank", ck: "wits:+0", ok: "op+25 wits+2 fame+5", okT: "You turn their whole common room upside down. Literally.", no: "op-20", noT: "It backfires. YOUR common room is now upside down." },
    { t: "Stay out of it", ok: "tal:main+6", okT: "You get more work done than anyone." } ] },
  { id: "undercroft", ph: "a", if: C => C.schoolYear >= 2, t: "You overhear teachers: a {M} has escaped into the Undercroft beneath the school.", c: [
    { t: "⚔️ Go after it yourself", ck: "main:+10", ok: "fame+25 op+40 main+2 trophy:🛡️:Saved_the_Undercroft", okT: "You face the {M} alone, and win. The whole Academy cheers for you at dinner.", no: "injury:Claw wounds:2 op-10", noT: "It nearly gets you. Teachers drag you out unconscious." },
    { t: "Tell the Headmaster", ok: "op+10 spirit+1", okT: "The Headmaster thanks you. The beast is caught by morning." } ] },
  { id: "homesick", ph: "a", t: "{F} is homesick and wants to leave the Academy for good.", c: [
    { t: "🎭 Cheer them up", ck: "charm:-5", ok: "charm+2 spirit+1", okT: "You stay up talking all night. {F} decides to stay.", no: "charm-1", noT: "Nothing you say helps. {F} goes home for a while." },
    { t: "Give them space", ok: "energy+5", okT: "{F} comes back on their own a week later." } ] },
  { id: "petloose", ph: "a", t: "Your {P} gets loose in the Great Hall during dinner and lands in the Headmaster's soup.", c: [
    { t: "🏹 Catch it fast", ck: "agility:+0", ok: "agility+2", okT: "A perfect dive across three tables. People applaud.", no: "op-10", noT: "You knock over the pudding tower instead." },
    { t: "🎭 Make a joke of it", ck: "charm:+0", ok: "charm+2 op+5", okT: "Even the Headmaster laughs.", no: "op-10", noT: "The Headmaster does not laugh." } ] },
  { id: "namebook", ph: "a", t: "A book in the restricted section has YOUR name written inside the cover in old ink.", c: [
    { t: "Read it", ck: "spirit:+0", ok: "tal:rand+12 wits+2 flag:prophecy", okT: "It's a prophecy: \"The Frstborn shall face the First Dragon.\" Gulp.", no: "injury:Cursed:2", noT: "The book was cursed. You sleepwalk for a month." },
    { t: "Burn it", ok: "spirit+1", okT: "The flames burn green. You hear laughter. Weird." } ] },
  { id: "guard", ph: "a", t: "The Headmaster asks for volunteers to guard the school walls during the Blood Moon.", c: [
    { t: "Volunteer", ok: "might+1 spirit+1 tal:warding+8 energy-20 op+15", okT: "A long, cold night, but something did try to climb the walls. You stopped it." },
    { t: "Stay in bed", ok: "energy+10", okT: "You sleep through the whole thing." } ] },
  { id: "prefect", ph: "a", once: true, if: C => C.schoolYear >= 5, t: "You're offered the silver badge of Prefect of {O}.", c: [
    { t: "👑 Accept", ok: "flag:prefect tal:leadership+12 fame+10 trophy:🎖️:Prefect_of_the_Order", okT: "You polish the badge every morning." },
    { t: "Decline", ok: "energy+10", okT: "Too much paperwork." } ] },
  { id: "dragontamer", ph: "a", t: "A travelling dragon-tamer visits the Academy with a young storm dragon.", c: [
    { t: "🐉 Ask to ride it", ck: "agility:+5", ok: "tal:dragonriding+15 fame+10", okT: "You fly over the towers. Best day of your life.", no: "injury:Broken arm:1", noT: "It throws you off. Into a tree." },
    { t: "Help feed it", ok: "tal:beasttaming+10", okT: "The dragon likes you. It nuzzles your hand." } ] },
  { id: "blamed", ph: "a", t: "{R} is caught cheating, and tells everyone it was your idea.", c: [
    { t: "🎭 Prove your innocence", ck: "charm:+0", ok: "charm+2 fame+5", okT: "The truth comes out. {R} is the one in trouble.", no: "op-25", noT: "Nobody believes you. Detention for a month." },
    { t: "⚔️ Challenge them to a duel", ck: "main:+0", ok: "main+2 fame+8", okT: "You win, and {R} admits the truth in front of everyone.", no: "fame-5", noT: "You lose AND get in trouble." } ] },
  { id: "mirror", ph: "a", once: true, t: "A hidden room. Inside, a tall mirror that shows your future.", c: [
    { t: "🔮 Look into it", ok: "tal:divination+12 flag:mirror", okT: "You see yourself older, wearing a crown. Or was it a trick?" },
    { t: "Smash it", ok: "might+1", okT: "Seven years of bad luck? You'll risk it." } ] },
  { id: "feast", ph: "a", t: "The kitchen sprites invite you to their secret midnight feast.", c: [
    { t: "Go", ok: "energy+25 charm+1", okT: "Honey cakes, dragonfruit pie and stories until dawn." },
    { t: "Decline", ok: "wits+1", okT: "You study instead. Boring, but useful." } ] },
  { id: "rivalhelp", ph: "a", if: C => C.schoolYear >= 4, t: "{R} is failing and secretly asks you for help before the exams.", c: [
    { t: "Help them", ok: "spirit+2 flag:rivalsoft", okT: "{R} mutters 'thanks'. Something has changed between you." },
    { t: "Refuse", ok: "fame+2", okT: "{R} glares at you. The rivalry is alive and well." } ] },

  // ===================== CAREER =====================
  { id: "village", ph: "c", t: "A poor village begs you to save them from a {M}. They can't pay much.", c: [
    { t: "⚔️ Help them for free", ck: "main:+0", ok: "fame+30 spirit+1 energy-20", okT: "You save the village. They name a well after you.", no: "fame+10 injury:Deep cut:1", noT: "You drive it off, barely. They're grateful anyway." },
    { t: "💰 Demand payment", ok: "gold+80 fame-10", okT: "They scrape together 80 gold. People talk." },
    { t: "Refuse", ok: "", okT: "You ride on." } ] },
  { id: "feastinsult", ph: "c", t: "At the Royal Feast, {R} mocks you in front of the King.", c: [
    { t: "⚔️ Duel them right there", ck: "main:+5", ok: "fame+40 main+1", okT: "Steel and sparks in the throne room. You win. The King laughs and raises his cup to you.", no: "fame-20 injury:Wounded pride:1", noT: "{R} wins. The whole court saw it." },
    { t: "🎭 Insult them back, better", ck: "charm:+0", ok: "fame+20 charm+2", okT: "The whole hall roars with laughter at {R}.", no: "fame-5", noT: "Your joke falls flat." },
    { t: "Ignore it", ok: "spirit+1", okT: "You're above this." } ] },
  { id: "scroll", ph: "c", t: "A dying wizard presses a sealed scroll into your hands. \"Only you…\"", c: [
    { t: "Open it", ck: "arcana:+0", ok: "tal:magic+18 arcana+2", okT: "Ancient magic pours into your mind.", no: "injury:Cursed:2", noT: "A curse! Your shadow moves on its own for a while." },
    { t: "Sell it to a collector", ok: "gold+250", okT: "250 gold. Not bad for a piece of paper." } ] },
  { id: "meet", ph: "c", if: C => !C.partner, t: "At the Gilded Goose tavern you meet someone who makes you forget your quest.", c: [
    { t: "🎭 Ask them to dinner", ck: "charm:-5", ok: "partner charm+2", okT: "One dinner turns into many. You're in love with {Pa}.", no: "charm-1", noT: "They're already taken. Ouch." },
    { t: "Not now, duty calls", ok: "tal:main+6", okT: "Maybe another time." } ] },
  { id: "propose", ph: "c", if: C => C.partner && !C.flags.married, t: "{Pa} takes your hand under the stars. \"Will you marry me?\"", c: [
    { t: "💍 Yes!", ok: "flag:married spirit+3 trophy:💍:Married_{Pa}", okT: "A wedding with dragons, fireworks and every friend you ever made." },
    { t: "Not yet", ok: "", okT: "{Pa} understands. For now." } ] },
  { id: "baby", ph: "c", if: C => C.flags.married && C.kids.length < 4, t: "Big news: {Pa} is expecting a child!", c: [
    { t: "🍼 Wonderful!", ok: "kid spirit+2 energy-10", okT: "A healthy baby. You can't stop smiling." } ] },
  { id: "princess", ph: "c", if: C => C.rank >= 1, t: "The King asks you to escort his daughter across the dangerous Ashen Pass.", c: [
    { t: "🛡️ Accept", ck: "main:+5", ok: "fame+60 gold+200 trophy:👸:Royal_Escort", okT: "The princess arrives safely. The King owes you now.", no: "fame-20 injury:Arrow wound:2", noT: "An ambush. The princess is fine, but you're not." },
    { t: "Decline", ok: "", okT: "Someone else takes the job." } ] },
  { id: "cursedsword", ph: "c", t: "In a dusty shop, a black sword whispers your name. 400 gold.", c: [
    { t: "Buy it", if: C => C.gold >= 400, ok: "gold-400 weapon+1 flag:cursedblade", okT: "It feels amazing in your hand. A bit too amazing." },
    { t: "Leave it", ok: "spirit+1", okT: "The whispers follow you out of the shop." } ] },
  { id: "bandits", ph: "c", t: "Bandits jump out on the road. \"Your gold or your life!\"", c: [
    { t: "⚔️ Fight", ck: "main:-5", ok: "fame+10 gold+60", okT: "They run, dropping their own gold.", no: "gold-80 injury:Bruised:1", noT: "There were more of them than you thought." },
    { t: "🤝 Talk your way out", ck: "charm:-5", ok: "tal:diplomacy+8", okT: "By the end they offer to work for you.", no: "gold-60", noT: "They take your purse anyway." },
    { t: "🏃 Run", ck: "agility:-10", ok: "", okT: "Gone before they blink.", no: "gold-40", noT: "Not fast enough." } ] },
  { id: "loan", ph: "c", t: "Your old Academy friend {F} is in trouble and needs 150 gold.", c: [
    { t: "Lend it", if: C => C.gold >= 150, ok: "gold-150 flag:loan spirit+2", okT: "{F} hugs you. \"I'll pay you back, I swear!\"" },
    { t: "Refuse", ok: "", okT: "{F} looks hurt, but understands." } ] },
  { id: "payback", ph: "c", if: C => C.flags.loan, t: "{F} shows up at your door with a chest. \"Told you I'd pay you back!\"", c: [
    { t: "Open it", ok: "gold+400 unflag:loan", okT: "Inside: 400 gold. {F} made a fortune trading griffon feathers." } ] },
  { id: "dragon", ph: "c", if: C => C.rank >= 2 || C.fame > 300, t: "A great red dragon circles the capital, burning the harbour!", c: [
    { t: "🐉 Hunt it down", ck: "main:+15", ok: "fame+150 gold+500 trophy:🐲:Dragonslayer", okT: "A battle above the rooftops. The dragon falls into the sea. You are a hero.", no: "injury:Dragon burns:3 fame-10", noT: "Its fire catches you. You wake up weeks later in the Sanctum." },
    { t: "🛡️ Defend the city walls", ck: "spirit:+0", ok: "fame+60 tal:warding+10", okT: "Your shields hold. Thousands are saved.", no: "injury:Burns:1", noT: "The walls crack. You hold on, just." },
    { t: "🤝 Get people to safety", ok: "fame+30 charm+2", okT: "You lead a whole street out through the sewers." } ] },
  { id: "treason", ph: "c", if: C => C.guild, t: "The master of {G} is accused of selling secrets to the enemy.", c: [
    { t: "Defend them", ck: "charm:+0", ok: "rep+15", okT: "You prove it was a forgery. The master never forgets it.", no: "rep-10", noT: "Your name gets dragged into the mess." },
    { t: "🧠 Investigate", ck: "wits:+0", ok: "rep+20 fame+20", okT: "You find the real traitor. The guild is grateful.", no: "", noT: "The trail goes cold." },
    { t: "Stay out of it", ok: "", okT: "It blows over eventually." } ] },
  { id: "apprentice", ph: "c", if: C => C.age >= 30, t: "A young student from Aldermoor begs you to become their mentor.", c: [
    { t: "👨‍🏫 Take them on", ok: "flag:mentor fame+15 tal:leadership+8 energy-10", okT: "They're clumsy, but they remind you of yourself." },
    { t: "Decline", ok: "", okT: "You're too busy saving the Realm." } ] },
  { id: "book", ph: "c", if: C => C.fame >= 250, t: "A publisher wants you to write a book about your adventures.", c: [
    { t: "✍️ Write it", ok: "gold+300 fame+40 energy-20 trophy:📕:Bestselling_author", okT: "\"The Tales of {N}\" sells out in every city." },
    { t: "No time", ok: "", okT: "Maybe when you're retired." } ] },
  { id: "plague", ph: "c", t: "A grey plague is spreading through the southern towns.", c: [
    { t: "💚 Find a cure", ck: "spirit:+5", ok: "fame+70 tal:healing+10 trophy:⚕️:Ended_the_Grey_Plague", okT: "Your cure works. Bells ring in every town.", no: "injury:Grey fever:2", noT: "You catch it yourself. It takes weeks to recover." },
    { t: "⚗️ Brew potions to sell", ck: "wits:+0", ok: "gold+300 fame+10", okT: "It helps people and fills your purse.", no: "fame-10", noT: "Your potions don't work. People are angry." },
    { t: "Stay away", ok: "", okT: "You keep your distance." } ] },
  { id: "tournament", ph: "c", t: "The Tournament of Champions is announced. Heroes from every land will compete.", c: [
    { t: "🏆 Enter", ck: "main:+10", ok: "fame+80 gold+300 trophy:🏆:Tournament_of_Champions", okT: "Round after round you win. Then the final. CHAMPION!", no: "fame+10 injury:Bruised:1", noT: "You lose in the semi-final, but the crowd loved you." },
    { t: "Watch from the stands", ok: "wits+1", okT: "You study the fighters. Useful." } ] },
  { id: "demon", ph: "c", if: C => !C.flags.pact, t: "A smiling stranger with red eyes offers you power. \"Just a small favour, later.\"", c: [
    { t: "Accept the deal", ok: "main+8 flag:pact", okT: "Power floods through you. You try not to think about the 'favour'." },
    { t: "Refuse", ok: "spirit+3", okT: "The stranger vanishes in a puff of sulphur." } ] },
  { id: "collect", ph: "c", if: C => C.flags.pact, t: "The red-eyed stranger is back. \"Time for my favour.\"", c: [
    { t: "✨ Fight him", ck: "spirit:+10", ok: "unflag:pact fame+60 trophy:😈:Broke_a_demon_pact", okT: "You banish him back to the pit. Free!", no: "unflag:pact main-6 injury:Demon mark:2", noT: "He takes back his gift, and more." },
    { t: "Pay him 500 gold", if: C => C.gold >= 500, ok: "gold-500 unflag:pact", okT: "He counts every coin, then leaves forever." } ] },
  { id: "poison", ph: "c", if: C => C.fame >= 100, t: "At a banquet your wine tastes… strange.", c: [
    { t: "🌿 Find the antidote fast", ck: "wits:+5", ok: "tal:herbalism+8", okT: "Mixed it from table herbs. Someone wanted you dead.", no: "injury:Poisoned:2", noT: "You collapse at the table." } ] },
  { id: "song", ph: "c", if: C => C.fame >= 300, t: "Bards are singing a song about you in taverns across the Realm.", c: [
    { t: "🎵 Join in", ok: "fame+30 charm+2", okT: "You sing it louder than anyone." },
    { t: "Pretend not to hear", ok: "fame+15", okT: "You secretly love it." } ] },
  { id: "rivalcaught", ph: "c", t: "{R} has been captured by a goblin warband in the hills!", c: [
    { t: "⚔️ Rescue them", ck: "main:+0", ok: "fame+40 flag:rivalsoft", okT: "You break {R} out. They can't even look at you. \"…Thanks.\"", no: "injury:Goblin arrows:1", noT: "You both barely escape." },
    { t: "Leave them", ok: "fame-10", okT: "They escape on their own, and hate you even more." } ] },
  { id: "ysmere", ph: "c", t: "A map to the lost city of Ysmere falls into your hands.", c: [
    { t: "🗺️ Go on an expedition", ck: "wits:+5", ok: "gold+600 relic+1 fame+40 energy-30", okT: "Golden halls under the sand. You come home rich.", no: "energy-30 injury:Sunstroke:1", noT: "Lost in the desert for weeks. No city." },
    { t: "Sell the map", ok: "gold+150", okT: "Someone else can get lost in the desert." } ] },
  { id: "storm", ph: "c", t: "A great storm wrecks your house.", c: [
    { t: "Pay to fix it (150 gold)", if: C => C.gold >= 150, ok: "gold-150", okT: "Good as new." },
    { t: "💪 Fix it yourself", ok: "might+1 energy-25", okT: "Hard work, but it's done." } ] },
  { id: "kidschool", ph: "c", if: C => C.kids.length && C.age >= 40, once: true, t: "Your eldest gets their letter from Aldermoor Academy!", c: [
    { t: "🎉 Throw a party", ok: "spirit+3 gold-50", okT: "You give them your old {O} scarf. They're joining {O} too!" } ] },
  { id: "council", ph: "c", if: C => C.fame >= 700, once: true, t: "The King invites you to join the Royal Council of the First Realm.", c: [
    { t: "👑 Accept", ok: "flag:council fame+100 tal:leadership+12 trophy:🏛️:Royal_Councillor", okT: "You now help rule the Realm." },
    { t: "Decline. Adventure is your life", ok: "fame+20", okT: "The people love you more for it." } ] },
  // ===================== THE SHADOW WAR (a story across three years) =====================
  { id: "arc1", ph: "c", arc: 0, once: true, if: C => C.arc === 0 && C.age >= 21 && C.fame >= 120, t: "🌑 Villages in the north have gone silent. Travellers speak of shadows that move against the wind, and a crown of black iron.", c: [
    { t: "🧠 Investigate the silent villages", ck: "wits:+0", ok: "arc:1 flag:arcprep fame+20 tal:divination+6", okT: "In a burnt chapel you find a map: the Shadow King is gathering an army under Ironvale. You know where he'll strike.", no: "arc:1 injury:Shadow_bite:1", noT: "Something in the dark bites you and flees. You've seen enough to know this is real." },
    { t: "⚔️ Ride out and hunt the shadows", ck: "main:+0", ok: "arc:1 fame+30 main+1", okT: "You cut down three shadow-wraiths. They scream a name as they die: the Shadow King.", no: "arc:1 injury:Frostburn:1", noT: "The shadows are too many. You fall back." },
    { t: "Tell the King's council and move on", ok: "arc:1", okT: "The council laughs. They won't be laughing for long." } ] },
  { id: "arc2", ph: "c", arc: 1, once: true, if: C => C.arc === 1 && C.worldYear > C.arcY, t: "🌑 The Shadow King's army marches on Ironvale! Ten thousand shadows, and the city walls are old.", c: [
    { t: "🛡️ Hold the walls", ck: "spirit:+5", ok: "arc:2 fame+60 flag:arcprep tal:warding+8", okT: "Your shields hold through the night. Ironvale stands, and the army retreats into the mountains.", no: "arc:2 fame+15 injury:Shadow_wounds:2", noT: "The walls fall, but you get the people out. The army retreats with its prisoners." },
    { t: "⚔️ Strike their camp at night", ck: "main:+10", ok: "arc:2 fame+80 flag:arcprep trophy:🌑:Hero_of_Ironvale", okT: "You burn their banners and free the prisoners. The Shadow King himself sees your face and swears to kill you.", no: "arc:2 injury:Cursed_blade:2", noT: "It was a trap. You barely escape the camp." },
    { t: "🤝 Unite the guilds first", ck: "charm:+5", ok: "arc:2 fame+40 rep+20 flag:arcprep", okT: "For the first time in a century every guild marches together. Ironvale is saved.", no: "arc:2 fame-10", noT: "The guilds argue for weeks. Ironvale burns." } ] },
];

export const NAMES1 = ["Aldric", "Seren", "Kael", "Mira", "Thorne", "Isolde", "Bram", "Lyra", "Corvin", "Elowen", "Dax", "Nyx", "Rowan", "Vesper", "Garrick", "Ilya", "Tamsin", "Oren", "Zara", "Fenwick", "Marlo", "Juno", "Cass", "Ember", "Sable", "Wren", "Quill", "Hollis"];
export const NAMES2 = ["Morrow", "Blackwood", "Ashvale", "Thornfield", "Grimsby", "Silverleaf", "Duskmane", "Stormcrow", "Ironhart", "Vale", "Nightshade", "Brightwater", "Hollow", "Emberfell", "Frost", "Ravenscar", "Goldmane", "Wyrmwood"];
export const TEACHERS = ["Professor Vantablack", "Madam Ollivane", "Master Grudge", "Professor Seraphine", "Old Tobias", "Professor Kettle"];

export const GUILDS = {
  battlemages: { name: "The Battlemage Corps",  icon: "🔥", pref: ["arcana", "might"],   tal: ["pyromancy", "cryomancy", "stormcalling", "runecraft"], pr: 4, pay: 140 },
  dawn:        { name: "Knights of the Dawn",   icon: "🌅", pref: ["might", "spirit"],   tal: ["swordplay", "warding", "leadership"], pr: 5, pay: 150 },
  sanctum:     { name: "The Silver Sanctum",    icon: "🕊️", pref: ["spirit", "wits"],    tal: ["healing", "herbalism", "warding"], pr: 3, pay: 110 },
  knives:      { name: "The Velvet Knives",     icon: "🗡️", pref: ["agility", "wits"],   tal: ["stealth", "lockpicking", "illusion"], pr: 3, pay: 150 },
  wild:        { name: "The Wildwardens",       icon: "🌲", pref: ["agility", "spirit"], tal: ["archery", "beasttaming", "shapeshifting", "herbalism"], pr: 2, pay: 90 },
  obsidian:    { name: "The Obsidian Circle",   icon: "💀", pref: ["arcana", "wits"],    tal: ["necromancy", "divination", "runecraft"], pr: 3, pay: 130 },
  lyre:        { name: "The Golden Lyre",       icon: "🎵", pref: ["charm", "spirit"],   tal: ["bardsong", "diplomacy", "illusion"], pr: 2, pay: 100 },
  alchemists:  { name: "Royal Alchemists",      icon: "⚗️", pref: ["wits", "arcana"],    tal: ["alchemy", "herbalism", "enchanting"], pr: 3, pay: 140 },
  skyriders:   { name: "The Skyriders of Varn", icon: "🐉", pref: ["agility", "might"],  tal: ["dragonriding", "beasttaming", "archery"], pr: 5, pay: 160 },
  archive:     { name: "The Arcane Archive",    icon: "📚", pref: ["wits", "arcana"],    tal: ["divination", "timemagic", "enchanting", "runecraft"], pr: 4, pay: 120 },
  monastery:   { name: "Stormpeak Monastery",   icon: "⛰️", pref: ["might", "agility"],  tal: ["brawling", "stormcalling", "shapeshifting"], pr: 2, pay: 80 },
};
export const RANKS = ["Recruit", "Adept", "Veteran", "Captain", "Master", "Grandmaster"];
export const PLACES = ["the Whispering Woods", "Grimhollow Mines", "the Ashen Pass", "Saltmarsh Docks", "the Sunken Temple", "Frostspire Peak", "the Crimson Dunes", "the Old Kings' Tombs", "Moonlit Bog", "the Shattered Isles", "Ironvale", "the Hollow Moon Ruins"];
export const QUEST_TYPES = [
  { t: "Hunt the {M} of {P}",           ic: "⚔️", pool: ["swordplay", "archery", "brawling", "pyromancy", "cryomancy", "stormcalling", "necromancy", "shapeshifting", "dragonriding", "runecraft"] },
  { t: "Clear the {M} nest in {P}",     ic: "🔥", pool: ["pyromancy", "swordplay", "warding", "alchemy", "stormcalling", "brawling"] },
  { t: "Escort a caravan through {P}",  ic: "🛡️", pool: ["warding", "swordplay", "leadership", "archery", "healing"] },
  { t: "Steal back a relic from {P}",   ic: "💎", pool: ["stealth", "lockpicking", "illusion", "enchanting", "runecraft"] },
  { t: "Break the curse on {P}",        ic: "🔮", pool: ["healing", "divination", "necromancy", "runecraft", "enchanting", "bardsong"] },
  { t: "Spy on the cult in {P}",        ic: "🌑", pool: ["stealth", "illusion", "diplomacy", "lockpicking"] },
  { t: "Calm the wild beasts of {P}",   ic: "🐾", pool: ["beasttaming", "shapeshifting", "herbalism", "bardsong", "dragonriding"] },
  { t: "Stop the plague in {P}",        ic: "💚", pool: ["healing", "herbalism", "alchemy"] },
  { t: "Make peace with the {M} clans", ic: "🤝", pool: ["diplomacy", "bardsong", "leadership", "illusion"] },
  { t: "Map the depths of {P}",         ic: "🗺️", pool: ["divination", "stealth", "herbalism", "timemagic", "runecraft"] },
];
export const QUEST_MONSTERS = ["Goblin", "Dire Wolf", "Cave Troll", "Giant Spider", "Wraith", "Stone Golem", "Ember Imp", "Ravager", "Basilisk", "Wyvern", "Ghoul", "Harpy", "Minotaur", "Kraken", "Shadow Hound"];
export const LEGENDS = [
  { k: "gking",  t: "Overthrow the Goblin King",  ic: "🤴", need: 92,  fame: 300, gold: 1500, fameReq: 400 },
  { k: "lich",   t: "Destroy the Lich of Ironvale", ic: "☠️", need: 104, fame: 500, gold: 2500, fameReq: 800 },
  { k: "dragon", t: "Slay the First Dragon",       ic: "🐉", need: 116, fame: 900, gold: 5000, fameReq: 1300 },
];
export const MAGIC = ["pyromancy", "cryomancy", "stormcalling", "necromancy", "illusion", "divination", "timemagic", "enchanting", "runecraft"];
export const WEAPON_NOUN = { elementalist: "Staff", warden: "Warhammer", lifebinder: "Sunstaff", shadowblade: "Daggers", ranger: "Longbow", necromancer: "Scythe", bard: "Lute",
  alchemist: "Alembic", beastmaster: "Spear", runeknight: "Runeblade", illusionist: "Mirror-staff", monk: "Fist-wraps" };
export const TIER = ["Old", "Iron", "Fine", "Masterwork", "Enchanted", "Legendary"];
export const TIER_PRICE = [0, 90, 260, 700, 1600, 3600];

// ---------- QUEST APPROACHES & TWISTS ----------
export const APPROACHES = {
  force:   { ic: "⚔️", n: "Charge in",     s: ["might", "agility"], fav: ["⚔️", "🔥", "🛡️"] },
  cunning: { ic: "🌑", n: "Sneak & trick", s: ["agility", "wits"],  fav: ["💎", "🌑", "🗺️"] },
  words:   { ic: "🤝", n: "Talk & charm",  s: ["charm", "wits"],    fav: ["🤝", "🐾", "💚"] },
  magic:   { ic: "🔮", n: "Use magic",     s: ["arcana", "spirit"], fav: ["🔮", "🔥", "💚"] },
};
export const TWISTS = [
  { t: "Halfway there, you hear a child crying from a collapsed mine.", c: [["💚 Dig them out", -6, "fame+15 spirit+1 energy-10", "You pull the child out alive. It costs you time."], ["Keep going", 3, "fame-5", "You tell yourself someone else will help."]] },
  { t: "Another adventurer offers to team up, for half the gold.", c: [["🤝 Team up", 10, "halfgold", "Two blades are better than one."], ["Go alone", 0, "", "You work alone. Always have."]] },
  { t: "You find an old shrine glowing faintly in the forest.", c: [["✨ Pray at the shrine", "spirit", "", "A warm light fills you."], ["Walk past", 0, "", "Better not to mess with old gods."]] },
  { t: "Your {P} sniffs out a hidden path through the rocks.", c: [["🐾 Follow it", 7, "", "A shortcut! You arrive before anyone expects you."], ["Stay on the road", 0, "", "Safe and slow."]] },
  { t: "The bridge ahead collapses into the river!", c: [["🏹 Jump the gap", "agility", "", "You land it, just."], ["Take the long way round", -2, "energy-15", "It takes two extra days."]] },
  { t: "A chest of gold sits in the middle of a cave. Too easy?", c: [["💰 Grab it", -3, "gold+120 cursegold", "Gold! …and a strange chill down your spine."], ["Leave it", 2, "", "Probably a trap. You'll never know."]] },
  { t: "A storm rolls in. Lightning hits the trees around you.", c: [["⚡ Push through", "might", "energy-10", "Soaked to the bone, but you keep going."], ["Wait it out", -3, "energy+10", "You rest in a cave until morning."]] },
  { t: "A travelling witch offers you a potion. \"Free. For luck.\"", c: [["🧪 Drink it", "luck", "", "It tastes like burnt honey."], ["No thanks", 0, "", "Never take potions from strangers."]] },
  { t: "You spot an enemy scout. They haven't seen you yet.", c: [["🌑 Ambush them", "agility", "", "You catch them before they can warn the others."], ["Let them go", -4, "", "Now the enemy knows you're coming."]] },
];

// ---------- PERKS (pick one every time your rating passes a milestone) ----------
export const PERKS = {
  iron:      { ic: "🛡️", n: "Iron Body",       d: "Injuries are shorter and you dodge some of them" },
  silver:    { ic: "🗣️", n: "Silver Tongue",   d: "+8% on every Charm check, talking on quests is stronger" },
  hunter:    { ic: "💰", n: "Treasure Hunter", d: "+30% gold from quests" },
  star:      { ic: "🌟", n: "Born Star",       d: "+25% fame from everything" },
  scholar:   { ic: "📚", n: "Scholar",         d: "Studying and training give more" },
  tireless:  { ic: "⚡", n: "Tireless",        d: "+10 extra energy every season" },
  duelist:   { ic: "⚔️", n: "Duelist",         d: "+15% power in duels" },
  lucky:     { ic: "🍀", n: "Lucky",           d: "+6% on every check, better twists" },
  tactician: { ic: "🧭", n: "Tactician",       d: "+5 power on every quest" },
  beloved:   { ic: "❤️", n: "Beloved",         d: "Guild standing +30%, teaching pays double" },
  dragonheart:{ ic: "🐉", n: "Dragonheart",    d: "+10 power on legendary quests" },
  polymath:  { ic: "🧠", n: "Polymath",        d: "Learn new talents faster" },
};

// ---------- HOMES ----------
export const HOMES = [
  { ic: "🛏️", n: "Room at the Gilded Goose", price: 0 },
  { ic: "🏡", n: "Cottage",        price: 300 },
  { ic: "🏘️", n: "Townhouse",      price: 900 },
  { ic: "🏛️", n: "Manor",          price: 2500 },
  { ic: "🗼", n: "Wizard's Tower", price: 6000 },
  { ic: "🏰", n: "Castle",         price: 15000 },
];
export const SIGNATURE = { elementalist: "Fireball", warden: "Shield Bash", lifebinder: "Radiant Smite", shadowblade: "Shadowstep", ranger: "Piercing Shot", necromancer: "Bone Spear",
  bard: "Song of Ruin", alchemist: "Flask Bomb", beastmaster: "Wild Pounce", runeknight: "Rune Cleave", illusionist: "Mirror Strike", monk: "Thunder Palm" };
