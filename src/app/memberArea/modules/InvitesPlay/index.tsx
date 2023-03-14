import { faUserAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, List, notification } from 'antd'
import react, { useEffect, useState } from 'react'
import './styles.scss'

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const InvitesPlay = () => {
  const [api, contextHolder] = notification.useNotification();
  const [initLoading, setInitLoading] = useState(false);
  const [data, setData] = useState<any>();

  const getInvitesPlay = async () => {
    let inviteArray: any = []

    // const invites = await getPlayerInvitesFriend(auth.currentUser?.uid || '')

    // if (Object.entries(invites).length > 0) {
    //   Object.keys(invites).forEach((item) => {
    //     inviteArray.push(invites[item]);
    //   });
    //   setData(inviteArray)
    //   setInitLoading(false)
    // } else {
    //   setData(invites)
    //   setInitLoading(false)
    // }
  }

  useEffect(() => {
    getInvitesPlay()
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
      <h4 className="title__invites">Your Invites to play </h4>
      <section className="list__container">
        <List
          className="demo-loadmore-list"
          loading={initLoading}
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item: any, index) => (
            <List.Item
              actions={[
                <a key="list-loadmore-edit" className="decline__invite">Decline</a>,
                <a key="list-loadmore-edit" className="accept__invite">
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