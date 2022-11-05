import express from 'express'
import dotenv from 'dotenv'
import TelegramBot from "node-telegram-bot-api";
import keyboards from "./keyboards/keyboards.js";
import { read, write } from "./utils/fs.js";

const app = express()
dotenv.config()

app.use(express.json())

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true,
})

bot.onText(/\/start/, (msg) => {
  console.log(msg);
  bot.sendMessage(
    msg.chat.id,
    `Salom ${
      msg.chat.first_name == undefined
        ? msg.from.first_name
        : msg.chat.first_name
    }`,
    {
      reply_markup: {
        keyboard: keyboards.menu,
        resize_keyboard: true,
      },
    }
  );
});

bot.on("message", (msg) => {
  if (msg.text == "Bizning kurslar") {
    bot.sendMessage(msg.chat.id, "Bizning kurslar", {
      reply_markup: {
        keyboard: keyboards.courses,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  if (msg.text == "Asosiy menyu 🔙") {
    bot.sendMessage(msg.chat.id, "Bizning kurslar", {
      reply_markup: {
        keyboard: keyboards.menu,
        resize_keyboard: true,
      },
    });
  }
});

bot.on("message", (msg) => {
  const foundCourse = read("courses.json").find((e) => e.name == msg.text);

  if (foundCourse) {
    bot.sendPhoto(msg.chat.id, "./nodejs.png", {
      caption: `
        <i>
          ${foundCourse.desc}
        </i>\n<span class='tg-spoiler'>${foundCourse.price}</span>
      `,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Ro'yhatdan o'tish",
              callback_data: `${foundCourse.name}`,
            },
          ],
        ],
      },
    });
  }
});

bot.on("callback_query", async (msg) => {
  const chatId = msg.message.chat.id;

  if (msg.data) {
    const userContact = await bot.sendMessage(
      chatId,
      "Kontktiangizni kiriting",
      {
        reply_markup: JSON.stringify({
          keyboard: [
            [
              {
                text: "Kontaktingizni kiriting!",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
          force_reply: true,
          one_time_keyboard: true,
        }),
      }
    );

    bot.onReplyToMessage(chatId, userContact.message_id, async (contactMsg) => {
      const allRequests = read("requests.json");

      allRequests.push({
        id: allRequests.at(-1)?.id + 1 || 1,
        course: msg.data,
        address: contactMsg.contact.phone_number,
        name: contactMsg.from.first_name,
      });

      const newAllRequests = await write("requests.json", allRequests);

      if (newAllRequests) {
        bot.sendMessage(chatId, "Sizni so'rovingiz qabul qilindi!", {
          reply_markup: {
            keyboard: keyboards.menu,
            resize_keyboard: true,
          },
        });

        bot.sendMessage(
          "-1001890591171",
          `
          course: ${msg.data},
          address: ${contactMsg.contact.phone_number},
          name: ${contactMsg.from.first_name},
        `
        );
      }
    });
  }
});

app.get('/courses', (req, res) => {
  res.json(read('courses.json'))
})

app.post('/newCourse', async (req, res) => {
  const { name, price, desc } = req.body;

  const allCourses = read('courses.json')

  allCourses.push({
    id: allCourses.at(-1)?.id + 1 || 1,
    name, price, desc
  })

  await write('courses.json', allCourses)

  res.send('OK')
})

app.listen(process.env.PORT ?? 9090, console.log(process.env.PORT ?? 9090))