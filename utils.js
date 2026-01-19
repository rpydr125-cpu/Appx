function isAdmin(ctx) {
  return String(ctx.from.id) === String(process.env.ADMIN_ID);
}

async function safeEdit(ctx, msg, text) {
  try {
    if (!msg) return await ctx.reply(text);
    return await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      null,
      text
    );
  } catch {
    return msg;
  }
}

module.exports = { isAdmin, safeEdit };
