# ciptik.github.io

## Free API GPT JavaScript Library

This library provides a simple way to interact with a GPT-based chat API. It allows you to create multiple chat instances and send messages to them.

## Demo page

To showcase the usage of this library, you can visit our demo page:

[Live Demo](https://ciptik.github.io/index.html)

### Installation

To use this library in your project, include the following script tag in your HTML file:

```html
<script src="https://ciptik.github.io/free-api-gpt.js"></script>
```

### Usage

Here's a basic example of how to use the library:

```javascript
(async () => {
    const bot = await Bot.init();
    const chat1 = await bot.createChat();
    console.log(await chat1.sendMessage("Hello, first chat!"));

    const chat2 = await bot.createChat();
    console.log(await chat2.sendMessage("Привет, second chat!"));

    const anotherBot = await Bot.init();
    console.log(bot === anotherBot); // true
})();
```
 
