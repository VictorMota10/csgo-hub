import { faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, List, notification } from 'antd'
import react, { useEffect, useState } from 'react'
import { acceptFriendInvite, declineFriendInvite, getPlayerInvitesFriend } from '../../../../../firebase-controllers/PlayerController';
import { auth } from '../../../../../infra/firebase';
import { getCookie } from '../../../../../utils/getCookies';
import './styles.scss'

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const Invites = () => {
  const [api, contextHolder] = notification.useNotification();
  const [initLoading, setInitLoading] = useState(false);
  const [data, setData] = useState<any>();

  const getInvites = async () => {
    let inviteArray: any = []

    const invites = await getPlayerInvitesFriend(auth.currentUser?.uid || '')

    if (Object.entries(invites).length > 0) {
      Object.keys(invites).forEach((item) => {
        inviteArray.push(invites[item]);
      });
      setData(inviteArray)
      setInitLoading(false)
    } else {
      setData(invites)
      setInitLoading(false)
    }
  }

  const acceptInvite = async (uidFriend: string, friendSenderData: any) => {
    const myUid: string = auth.currentUser?.uid || ''
    const friendAcceptedData = {
      uid: myUid,
      username: getCookie('username' || '')
    }

    const accepted = await acceptFriendInvite(myUid, uidFriend, friendSenderData, friendAcceptedData)
    if (accepted) {
      openNotification('success', 'Success', 'Player added to your friends list!')
      getInvites()
      return
    }
  }

  const declineInvite = async (uidFriend: string) => {
    const myUid: string = auth.currentUser?.uid || ''
    const declined = await declineFriendInvite(myUid, uidFriend)
    if (!declined) {
      openNotification('error', 'Error', 'Error on try to decline player invite.')
    } else {
      openNotification('success', 'Success', 'Sucess on decline invite!')
      getInvites()
      return
    }
  }

  useEffect(() => {
    setInitLoading(true)
    getInvites()
  }, [auth.currentUser?.uid])

  const openNotification = (type: NotificationType, title: string, message: string) => {
    api[type]({
      message: title,
      description: message,
    });
  };

  return (
    <>
      {contextHolder}
      <h4 className="title__invites">Your Invites</h4>
      <section className="list__container">
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item: any, index) => (
            <List.Item
              actions={[
                <a key="list-loadmore-edit" className="decline__invite" onClick={() => declineInvite(item[Object.getOwnPropertyNames(item)[index]]?.uid || item?.uid)}>Decline</a>,
                <a key="list-loadmore-edit" className="accept__invite"
                  onClick={() =>
                    acceptInvite(
                      item[Object.getOwnPropertyNames(item)[index]]?.uid || item?.uid,
                      { 
                        uid: item[Object.getOwnPropertyNames(item)[index]]?.uid || item?.uid, 
                        username: item[Object.getOwnPropertyNames(item)[index]]?.username || item?.username 
                      }
                    )}>
                  Accept
                </a>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={<FontAwesomeIcon icon={faUserAlt} />} />}
                title={item[Object.getOwnPropertyNames(item)[index]]?.username || item?.username}
              />
            </List.Item>
          )}
        />
      </section>
    </>
  )
}