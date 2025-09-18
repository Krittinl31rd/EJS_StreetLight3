
const customerAdminLayout="../views/layouts/customer_admin"
const customerMemberLayout="../views/layouts/customer_member"
exports.switchLayout=(site_role) => {
    let layout;
    if (site_role=="Admin") {
        layout=customerAdminLayout
    } else if (site_role=="Member") {
        layout=customerMemberLayout
    }
    return layout
}