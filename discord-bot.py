import discord
from discord.ext import commands, tasks
from datetime import datetime, time

intents = discord.Intents.default()
intents.messages = True
intents.reactions = True

bot = commands.Bot(command_prefix="!", intents=intents)
points = {}
bot.tasks = {}


@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    morning_checkin.start()
    midday_checkin.start()
    evening_reflection.start()


@tasks.loop(time=[time(hour=8, minute=0)])  # Morning Check-In
async def morning_checkin():
    channel = bot.get_channel(YOUR_CHANNEL_ID)
    await channel.send(
        "Good morning! Ready to conquer the day? Here are your tasks for today along with some small steps to help you get started..."
    )


@tasks.loop(time=[time(hour=12, minute=0)])  # Midday Check-In
async def midday_checkin():
    channel = bot.get_channel(YOUR_CHANNEL_ID)
    await channel.send(
        "Hey! Checking in to see how you're doing with your tasks! How are you feeling on a scale of 1-10? Remember, you can take small steps. Anything you want to chat about or get off your mind?"
    )


@tasks.loop(time=[time(hour=20, minute=0)])  # Evening Reflection
async def evening_reflection():
    channel = bot.get_channel(YOUR_CHANNEL_ID)
    await channel.send(
        "Great job today! Let's review what you’ve accomplished and plan for tomorrow..."
    )


@bot.command()
async def addtasks(ctx, *, tasks):
    tasks_list = tasks.split(", ")
    message = await ctx.send(
        f"Here are your tasks:\n"
        + "\n".join([f"{idx+1}. {task}" for idx, task in enumerate(tasks_list)])
    )
    for i in range(len(tasks_list)):
        await message.add_reaction("✅")

    # Store message ID and tasks
    bot.tasks[message.id] = (ctx.author.id, tasks_list)


@bot.event
async def on_reaction_add(reaction, user):
    if user.bot:
        return

    message_id = reaction.message.id
    if message_id in bot.tasks:
        task_owner, tasks_list = bot.tasks[message_id]
        if user.id == task_owner and str(reaction.emoji) == "✅":
            points[user.id] = 0
        points[user.id] += 1  # Assign 1 point per task
        await reaction.message.channel.send(
            f"Great job {user.mention}! You've earned a point. Total points: {points[user.id]}"
        )


@bot.command()
async def points(ctx):
    user_points = points.get(ctx.author.id, 0)
    await ctx.send(f"{ctx.author.mention}, you have {user_points} points.")


bot.run("YOUR_BOT_TOKEN")
