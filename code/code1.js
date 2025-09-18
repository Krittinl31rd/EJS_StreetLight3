exports.DashboardPage=async (req, res) => {
    res.render('owner/dashboard', {
        layout: ownerLayout,
        tab: 'dashboard',
        title: 'Innovative',
        currentRoute: '/dashboard',
        member: req.member,
        messages: req.flash(),
    })
}

exports.MemberPage=async (req, res) => {
    res.render('owner/manage_member', {
        layout: ownerLayout,
        tab: 'members',
        title: 'Innovative',
        currentRoute: '/members',
        member: req.member,
        messages: req.flash(),
        siteWithMembers: await siteWithMembers(),
        allMember: await membersList(),
        allRole,
        allEnabled,
        allRoleSite
    })
}

exports.SitePage=async (req, res) => {
    res.render('owner/manage_site', {
        layout: ownerLayout,
        tab: 'sites',
        title: 'Innovative',
        currentRoute: '/sites',
        member: req.member,
        messages: req.flash(),
        sites_list: await sitesList()
    })
}

exports.CreateMember_AddToSite=async (req, res) => {
    const { username, member_name, email, role, site_id, site_role }=req.body
    const defaultPassword='123456789'
    try {
        // find already member
        const querySelect=`
                SELECT username, email 
                FROM Lamp_Members 
                WHERE username = :username OR email = :email`;

        const isMember=await sequelize.query(querySelect, {
            replacements: { username, email },
            type: sequelize.QueryTypes.SELECT,
        })

        if (isMember.length>0) {
            let exists=[];
            isMember.forEach(member => {
                if (member.username==username) exists.push(i18n.__('username'));
                if (member.email==email) exists.push(i18n.__('email'));
            });
            return res.status(400).json({ message: `${exists.join(", ")} ${i18n.__("dataAlready")}` })
        }

        // hash password
        const hashPassword=await bcrypt.hash(defaultPassword, 10)

        // created member
        const queryCreate=`
            INSERT INTO Lamp_Members 
            (username, password, member_name, email, role) 
            OUTPUT INSERTED.id
            VALUES (:username, :password, :member_name, :email, :role)`;
        const [member]=await sequelize.query(queryCreate, {
            replacements: { username, password: hashPassword, member_name, email, role },
            type: sequelize.QueryTypes.INSERT,
        });

        const member_id=member[0].id;

        // mapping member in site
        const queryCreateSiteMapping=`
            INSERT INTO Lamp_Member_Site_Mapping
            ( member_id, site_id)
            VALUES (:member_id, :site_id)`;

        await sequelize.query(queryCreateSiteMapping, {
            replacements: { member_id, site_id },
            type: sequelize.QueryTypes.INSERT,
        });

        const queryCreatePremissionSite=`
        INSERT INTO Lamp_Permissions
        (member_id, site_id, site_role)
        VALUES (:member_id, :site_id, :site_role)`;

        await sequelize.query(queryCreatePremissionSite, {
            replacements: { member_id, site_id, site_role },
            type: sequelize.QueryTypes.INSERT,
        })

        res.status(200).json({
            message: `${i18n.__("createSuccess")}!`,
        })
    } catch (err) {
        console.log(err);
        res.status(500).send('Internet Server Error')
    }
}

exports.AddMemberToSite=async (req, res) => {
    const site_id=req.params.site_id
    const { member_id, site_role }=req.body
    try {

        const queryInsertMapping=`
                INSERT INTO Lamp_Member_Site_Mapping (member_id, site_id)
                VALUES (:member_id, :site_id)`;
        await sequelize.query(queryInsertMapping, {
            replacements: { member_id, site_id },
            type: sequelize.QueryTypes.INSERT,
        });

        const queryInsertPermission=`
                INSERT INTO Lamp_Permissions (member_id, site_id, site_role)
                VALUES (:member_id, :site_id, :site_role)`;
        await sequelize.query(queryInsertPermission, {
            replacements: { member_id, site_id, site_role },
            type: sequelize.QueryTypes.INSERT,
        });

        return res.status(200).json({
            message: `Assigned new site_role for member ${member_id} at site ${site_id}`,
        });

    } catch (err) {
        console.log(err);
        res.status(500).send('Internet Server Error')
    }
}

exports.UpdateMember=async (req, res) => {
    const member_id=req.params.member_id;
    const current_site=req.params.site_id;
    const { site_id, site_role }=req.body;

    try {
        // ตรวจสอบว่า member_id นี้มีการมอบหมายให้ site_id เดิมอยู่แล้ว
        const queryExistingMapping=`
            SELECT lp.site_role
            FROM Lamp_Member_Site_Mapping lmsm
            JOIN Lamp_Permissions lp ON lmsm.member_id = lp.member_id AND lmsm.site_id = lp.site_id
            WHERE lmsm.member_id = :member_id AND lmsm.site_id = :current_site`;
        const existingMapping=await sequelize.query(queryExistingMapping, {
            replacements: { member_id, current_site },
            type: sequelize.QueryTypes.SELECT
        });

        //  ตรวจสอบว่า member_id นี้มีการมอบหมายให้ site_id ใหม่แล้วหรือไม่
        const queryCheckDuplicate=`
            SELECT *
            FROM Lamp_Member_Site_Mapping 
            WHERE member_id = :member_id AND site_id = :site_id`;
        const checkDuplicate=await sequelize.query(queryCheckDuplicate, {
            replacements: { member_id, site_id },
            type: sequelize.QueryTypes.SELECT
        });

        // ถ้ามีข้อมูลซ้ำและไม่ใช่การเปลี่ยนแค่ role
        if (checkDuplicate.length>0&&site_id!==current_site) {
            return res.status(400).json({
                message: `Member is already assigned to site ${site_id}.`
            });
        }

        // ถ้าไม่มีการมอบหมาย site_id นี้ให้ member_id, ให้ลบข้อมูลเก่าและเพิ่มข้อมูลใหม่
        if (existingMapping.length==0||site_id!==current_site) {
            // ลบข้อมูลเก่า
            const queryDeleteMapping=`
                DELETE FROM Lamp_Member_Site_Mapping
                WHERE member_id = :member_id AND site_id = :current_site`;
            await sequelize.query(queryDeleteMapping, {
                replacements: { member_id, current_site },
                type: sequelize.QueryTypes.DELETE,
            });

            const queryDeletePermission=`
                DELETE FROM Lamp_Permissions
                WHERE member_id = :member_id AND site_id = :current_site`;
            await sequelize.query(queryDeletePermission, {
                replacements: { member_id, current_site },
                type: sequelize.QueryTypes.DELETE,
            });

            // เพิ่มข้อมูลใหม่
            const queryInsertMapping=`
                INSERT INTO Lamp_Member_Site_Mapping (member_id, site_id)
                VALUES (:member_id, :site_id)`;
            await sequelize.query(queryInsertMapping, {
                replacements: { member_id, site_id },
                type: sequelize.QueryTypes.INSERT,
            });

            const queryInsertPermission=`
                INSERT INTO Lamp_Permissions (member_id, site_id, site_role)
                VALUES (:member_id, :site_id, :site_role)`;
            await sequelize.query(queryInsertPermission, {
                replacements: { member_id, site_id, site_role },
                type: sequelize.QueryTypes.INSERT,
            });

            return res.status(200).json({
                message: `Assigned new site_role for member ${member_id} at site ${site_id}`,
            });
        }

        // อัปเดต role ถ้าไม่มีการเปลี่ยนแปลงใน site_id
        if (existingMapping.length>0) {
            const currentRole=existingMapping[0].site_role;

            // ถ้าไม่มีการเปลี่ยนแปลง
            if (site_id===current_site&&currentRole===site_role) {
                return res.status(400).json({
                    message: `Member is already assigned to site ${current_site} with the same role. No changes were made.`
                });
            }

            // อัปเดต site_role ถ้าแตกต่าง
            const queryUpdateRole=`
                UPDATE Lamp_Permissions
                SET site_role = :site_role
                WHERE member_id = :member_id AND site_id = :current_site`;
            await sequelize.query(queryUpdateRole, {
                replacements: { member_id, current_site, site_role },
                type: sequelize.QueryTypes.UPDATE,
            });

            return res.status(200).json({
                message: `Updated site_role for member ${member_id} at site ${current_site}`,
            });
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
