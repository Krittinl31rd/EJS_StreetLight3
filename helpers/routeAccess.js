


const ACCESS_ROLES={
    OWNER: "Owner",
    ADMIN: "Admin",
    CUSTOMER: "Customer",
    AGENT: "Agent",
    TECHNICIAN: "Technician"
};

const SITE_ROLES={
    ADMIN: "Admin",
    MANAGER: "Manager",
    MEMBER: "Member",
    VIEWER: "Viewer"
};

const allRole=["Customer", "Agent", "Technician"]

const allEnabled=[0, 1]

const allRoleSite=["Admin", "Member", "Manager"]

module.exports={ ACCESS_ROLES, SITE_ROLES, allRole, allEnabled, allRoleSite };
