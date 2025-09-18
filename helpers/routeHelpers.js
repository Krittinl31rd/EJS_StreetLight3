function isActiveRoute(route, currentRoute, cmd=false) {
    if (cmd==false) {
        return route===currentRoute? "text-gray-900 bg-white dark:bg-black dark:text-white":
            "text-gray-900 dark:text-white";
    } else {
        return route===currentRoute? "border-l-2 dark:border-white border-black":
            "border-0";
    }

}

// <%= isActiveRoute('/manage', currentRoute, true)%>
// <%= isActiveRoute('/manage', currentRoute, true)%>
module.exports={ isActiveRoute };