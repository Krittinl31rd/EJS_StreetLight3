exports.GetFormattedDate=() => {
    const date=new Date();
    return date.toISOString().slice(0, 23).replace("T", " ");
}