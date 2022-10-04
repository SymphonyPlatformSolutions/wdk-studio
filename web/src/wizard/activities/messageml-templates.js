const MessageMLTemplates = {
    simple: '<div>Hello <b>World!</b></div>',
    table: `<table>
              <thead>
                <tr>
                  <td>Header 1</td>        
                  <td>Header 2</td>
                  <td>Header 3</td>
                  <td>Header 4</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="2">Content 1.1 with colspan</td>
                  <td>Content 3.1</td>
                  <td>Content 4.1</td>
                </tr>
                <tr>
                  <td rowspan="2">Content 1.2 with rowspan</td>
                  <td>Content 2.2</td>
                  <td>Content 3.2</td>
                  <td>Content 4.2</td>
                </tr>
                <tr>
                  <td>Content 2.3</td>
                  <td>Content 3.3</td>
                  <td>Content 4.3</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Footer 1</td>
                  <td>Footer 2</td>
                  <td>Footer 3</td>
                  <td>Footer 4</td>
                </tr>
              </tfoot>
            </table>`,
    form: `<form id="AddressForm">
            <text-field name="address" placeholder="type your address..." required="true"/>
            <select name="city">              
              <option selected="true" value="ny">New York</option>
              <option value="van">Vancouver</option>
              <option value="par">Paris</option>
            </select>
            <button name="submit" type="action">Submit</button>
            <button type="reset">Reset</button>
          </form>`,
    card: `<card accent="tempo-bg-color--blue" iconSrc="./images/favicon.png">
            <header>Card Header. Always visible.</header>
            <body>Card Body. User must click to view it.</body>
          </card>`
}

export default MessageMLTemplates;