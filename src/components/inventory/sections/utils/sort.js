export const sortItemsByActionRequests = list => {
  if (!list || !list.listItems)
    return []
  
  list.listItems = list.listItems.sort((a, b) => {
    if (a.attributes['action-request'] < b.attributes['action-request']) return 1;
    if (a.attributes['action-request'] > b.attributes['action-request']) return -1;
    return 0
  })
  return list
}

export const sortOrdersByActionRequests = list => {
  if (!list || !list.listItems)
    return []
  
  list.listItems = list.listItems.map(item => {
    if(item.map)
      return item.sort((a, b) => {
        if (a.attributes['action-request'] < b.attributes['action-request']) return 1;
        if (a.attributes['action-request'] > b.attributes['action-request']) return -1;
        return 0
      })
    else {
      return {...item, items: item.items.sort((a, b) => {
        if (a.attributes['action-request'] < b.attributes['action-request']) return 1;
        if (a.attributes['action-request'] > b.attributes['action-request']) return -1;
        return 0
      })}
    }
  })
  return list
}