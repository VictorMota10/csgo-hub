import './styles.scss'
import React, { useEffect, useState } from 'react'
import { Avatar, List, notification } from 'antd';
import { Input } from 'antd';
import { getPlayerBySteamID, getPlayerByUsername, inviteFriend } from '../../../../firebase-controllers/PlayerController';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { auth } from '../../../../infra/firebase';
import { getCookie } from '../../../../utils/getCookies';

const { Search } = Input;

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Friends = () => {
  const [initLoading, setInitLoading] = useState(false);
  const [data, setData] = useState<any>();

  const [api, contextHolder] = notification.useNotification();

  const searchUsers = async (querySearch: string) => {
    setData([]);
    let playerData = []
    setInitLoading(true);
    const regexNumbers = new RegExp(/^\d+$/)

    if (regexNumbers.test(querySearch)) {
      const player = await getPlayerBySteamID(querySearch)
      if (player.length !== 0) {
        playerData.push(player)
        setData(playerData);
      }
    } else {
      const player = await getPlayerByUsername(querySearch)
      if (player.length !== 0) {
        playerData.push(player)
        setData(playerData);
      }
    }

    setInitLoading(false);
  }

  const handleSendInvite = async (uid: string) => {
    const playerSenderInvite: any = {
      uid: auth.currentUser?.uid,
      username: getCookie('username' || '')
    }

    const invitedPlayer = await inviteFriend(uid, playerSenderInvite)
    if(!invitedPlayer){
      openNotification('error', 'Error', 'Player already added or invitation already sent.')
    } else {
      openNotification('success', 'Success', 'Invitation sent successfully!')
    }
  }

  const openNotification = (type: NotificationType, title: string, message: string) => {
    api[type]({
      message: title,
      description: message,
    });
  };
  return (
    <>
      {contextHolder}
      <div className='content__area--friends'>
        <section className="search__container">
          <Search name="searchUser" placeholder="Search by SteamID or Username" onSearch={(e) => searchUsers(e)} enterButton />
        </section>
        <section className="list__container">
          <List
            className="demo-loadmore-list"
            loading={initLoading}
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item: any, index) => (
              <List.Item
                actions={[<a key="list-loadmore-edit" onClick={() => handleSendInvite(item?.uid)}>Send Invite</a>]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item?.avatar || <FontAwesomeIcon icon={faUserAlt} />} />}
                  title={item?.username}
                />
              </List.Item>
            )}
          />
        </section>
      </div>
    </>
  )
}