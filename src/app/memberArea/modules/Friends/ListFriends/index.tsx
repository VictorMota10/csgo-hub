import { faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, List, notification } from 'antd'
import react, { useEffect, useState } from 'react'
import { getFriendList, handleUnfriend } from '../../../../../firebase-controllers/PlayerController';
import { auth } from '../../../../../infra/firebase';
import './styles.scss'

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const ListFriends = () => {
  const [api, contextHolder] = notification.useNotification();
  const [initLoading, setInitLoading] = useState(false);
  const [data, setData] = useState<any>();

  const handleGetFriendList = async () => {
    setData([])
    let listOfFriendsArray: any = []

    const myUid = auth.currentUser?.uid || ''
    const listOfFriends = await getFriendList(myUid)

    if (Object.entries(listOfFriends).length > 0) {
      Object.keys(listOfFriends).forEach((item) => {
        listOfFriendsArray.push(listOfFriends[item]);
      });
      setData(listOfFriendsArray)
      setInitLoading(false)

    } else {
      setData(listOfFriends)
      setInitLoading(false)
    }
  }

  const unfriend = async (uid: string, uidFriend: string) => {
    const isUnfriend = await handleUnfriend(uid, uidFriend)
    if (isUnfriend) {
      openNotification('success', 'Success', 'Friendship successfully broken!')
      handleGetFriendList()
      return
    }
  }

  useEffect(() => {
    setInitLoading(true)
    handleGetFriendList()
  }, [])

  const openNotification = (type: NotificationType, title: string, message: string) => {
    api[type]({
      message: title,
      description: message,
    });
  };

  return (
    <>
      {contextHolder}
      <h4 className="title__invites">Friend's list</h4>
      <section className="list__container">
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item: any, index: any) => (
            <List.Item
              actions={[
                <a key="list-loadmore-edit" className='decline__invite'
                  onClick={() => unfriend(auth.currentUser?.uid || '', item?.uid || item[Object.getOwnPropertyNames(item)[index]]?.uid)}>
                  Unfriend
                </a>,
                <a key="list-loadmore-edit"
                  onClick={() => alert('Função indisponivel')}>
                  See profile
                </a>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={<FontAwesomeIcon icon={faUserAlt} />} />}
                title={item?.username || item[Object.getOwnPropertyNames(item)[index]]?.username}
              />
            </List.Item>
          )}
        />
      </section>
    </>
  )
}